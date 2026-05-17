terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "poetic-chariot-495412-t1"
  region  = "europe-central2"
}

# Sieć VPC
resource "google_compute_network" "vpc_network" {
  name                    = "lacco-vpc-prod"
  auto_create_subnetworks = true
}

# Dedykowane konto usługowe dla węzłów GKE (Least Privilege)
resource "google_service_account" "gke_nodes_sa" {
  account_id   = "lacco-gke-nodes-sa"
  display_name = "Dedykowane konto dla wezlow klastra GKE Lacco"
}

# Przypisanie uprawnień do zapisu logów i metryk
resource "google_project_iam_member" "gke_log_writer" {
  project = "poetic-chariot-495412-t1"
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.gke_nodes_sa.email}"
}

resource "google_project_iam_member" "gke_metric_writer" {
  project = "poetic-chariot-495412-t1"
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.gke_nodes_sa.email}"
}

resource "google_project_iam_member" "gke_monitoring_viewer" {
  project = "poetic-chariot-495412-t1"
  role    = "roles/monitoring.viewer"
  member  = "serviceAccount:${google_service_account.gke_nodes_sa.email}"
}

# Sam klaster - bez wewnętrznej definicji node_config, co zapobiega jego niszczeniu
resource "google_container_cluster" "gke_cluster" {
  name               = "lacco-cluster-prod"
  location           = "europe-central2-a"
  initial_node_count = 1

  network = "default"

  deletion_protection = true

  # Usuwamy domyślny node pool natychmiast po utworzeniu klastra (w tym przypadku zachowa obecny stan klastra)
  remove_default_node_pool = false

  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "34.12.147.4/32"
      display_name = "Mateusz Cloud Shell"
    }
  }
}

# Nowa, utwardzona pula węzłów podpięta do klastra
resource "google_container_node_pool" "hardened_nodes" {
  name       = "lacco-hardened-pool"
  location   = "europe-central2-a"
  cluster    = google_container_cluster.gke_cluster.name
  node_count = 1

  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 32
    
    service_account = google_service_account.gke_nodes_sa.email

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

# Bucket Storage dla Frontendu
resource "google_storage_bucket" "frontend_bucket" {
  name                        = "lacco-frontend-static"
  location                    = "europe-central2"
  force_destroy               = true
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_binding" "public_access" {
  bucket = google_storage_bucket.frontend_bucket.name
  role   = "roles/storage.objectViewer"
  members = [
    "allUsers",
  ]
}

# Uptime Check
resource "google_monitoring_uptime_check_config" "backend_uptime_check" {
  display_name = "lacco-backend-uptime-check"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path = "/"
    port = 80
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = "poetic-chariot-495412-t1"
      host       = "34.118.29.116"
    }
  }
}

# Polityka alertów
resource "google_monitoring_alert_policy" "backend_alert_policy" {
  display_name = "lacco-backend-alert-policy"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Uptime Check Failure"

    condition_threshold {
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 1

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_FRACTION_TRUE"
      }
    }
  }
}