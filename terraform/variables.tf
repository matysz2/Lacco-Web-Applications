variable "project_id" {
  type        = string
  description = "Identyfikator projektu w Google Cloud Platform (GCP)"
  default     = "poetic-chariot-495412-t1"
}

variable "region" {
  type        = string
  description = "Region, w ktorym beda tworzone zasoby sieciowe"
  default     = "europe-central2"
}

variable "zone" {
  type        = string
  description = "Strefa, w ktorej zostanie uruchomiony klaster lacco-cluster-prod"
  default     = "europe-central2-a"
}

variable "cluster_name" {
  type        = string
  description = "Nazwa klastra Kubernetes"
  default     = "lacco-cluster-prod"
}

variable "machine_type" {
  type        = string
  description = "Typ maszyny wirtualnej dla wezlow (Node) klastra GKE"
  default     = "e2-medium"
}