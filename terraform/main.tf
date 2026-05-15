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

resource "google_compute_network" "vpc_network" {
  name                    = "lacco-vpc-prod"
  auto_create_subnetworks = true
}

resource "google_container_cluster" "gke_cluster" {
  name     = "lacco-cluster-prod"
  location = "europe-central2-a" # Warszawa

  initial_node_count = 1

  node_config {
    machine_type = "e2-medium"

    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]
  }
}

resource "google_storage_bucket" "frontend_bucket" {
  name          = "lacco-frontend-static"
  location      = "EUROPE-CENTRAL2"
  force_destroy = false

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

resource "google_storage_bucket_iam_binding" "public_access" {
  bucket  = google_storage_bucket.frontend_bucket.name
  role    = "roles/storage.objectViewer"
  members = ["allUsers"]
}

# [Dzień 17] Fizyczny test dostępności (Uptime Check) dla Twojego IP Backendowego
resource "google_monitoring_uptime_check_config" "backend_uptime_check" {
  display_name = "Uptime Check - Backend Lacco"
  timeout      = "10s"   
  period       = "60s" # Sprawdzaj co minutę

  http_check {   
    path           = "/"
    port           = 8081
    use_ssl        = false
    request_method = "GET"
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = "poetic-chariot-495412-t1"
      host       = "34.185.171.112"
    }
  }
}

# [Dzień 17] POPRAWIONA Reguła alertu - powiązana bezpośrednio z powyższym testem
resource "google_monitoring_alert_policy" "backend_alert_policy" {
  display_name = "Backend Lacco - Awaria"
  combiner     = "OR"
  
  conditions {
    display_name = "Awaria usługi"
    condition_threshold {
      # Poprawiono na resource.labels.check_id
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\" AND resource.labels.check_id=\"${google_monitoring_uptime_check_config.backend_uptime_check.uptime_check_id}\""
      duration        = "60s"
      
      # Poprawiono: Alarmuj, gdy wartość spadnie poniżej 1 (czyli wyniesie 0 = brak odpowiedzi)
      comparison      = "COMPARISON_LT"
      threshold_value = 1
      
      trigger {
        count = 1
      }
    }
  }

  notification_channels = [
    "projects/poetic-chariot-495412-t1/notificationChannels/1536819764669807863"
  ]

  documentation {
    content   = "Pilne! Backend aplikacji Lacco na porcie 8081 przestał odpowiadać. Sprawdź stan aplikacji w Javie."
    mime_type = "text/markdown"
  }
}