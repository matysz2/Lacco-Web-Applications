Lacco Backend

Backend aplikacji sprzedażowej oparty o Spring Boot, JWT oraz architekturę przygotowaną pod środowiska Docker/Kubernetes i CI/CD.

Projekt został przygotowany jako praktyczne portfolio Fullstack + DevOps:

backend REST API,
security JWT,
monitoring Prometheus/Grafana,
konteneryzacja Docker,
deployment Kubernetes,
infrastruktura Terraform,
automatyzacja CI/CD.
Stack technologiczny
Backend
Java 17
Spring Boot 4
Spring Security
JWT (JJWT)
Spring Data JPA
PostgreSQL
Lombok
MapStruct
DevOps / Infrastructure
Docker
Kubernetes (K8s)
NGINX Reverse Proxy
Terraform
GitHub Actions CI/CD
Prometheus
Grafana
Alertmanager
Testing
JUnit 5
Mockito
Testcontainers
Architektura projektu
project/
│
├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│
├── k8s/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── secret.yaml
│
├── monitoring/
│   ├── prometheus.yml
│   ├── alert_rules.yml
│   ├── alertmanager.yml
│   └── docker-compose.yml
│
├── terraform/
│   └── main.tf
│
├── nginx/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── docker-compose.yml
├── .gitignore
└── README.md
Funkcjonalności
Authentication & Security
JWT Authentication
BCrypt password hashing
Role-based authorization
Spring Security
Stateless API
CORS configuration
DevOps
Dockerized backend/frontend
Kubernetes deployment
CI/CD pipeline
Reverse proxy via NGINX
Monitoring via Prometheus
Dashboards in Grafana
Alerting via Alertmanager
Monitoring

Aplikacja eksportuje metryki do:

Prometheus
Grafana dashboards
Alertmanager notifications

Monitorowane są m.in.:

użycie pamięci JVM,
CPU,
requesty HTTP,
status aplikacji,
uptime,
błędy backendu.
Setup lokalny
Wymagania
Java 17+
Maven 3.8+
Docker
PostgreSQL
Kubernetes (opcjonalnie lokalnie)
Git
Konfiguracja ENV

Skopiuj plik:

cp .env.example .env

Uzupełnij:

DATABASE_URL=jdbc:postgresql://localhost:5432/lacco
DATABASE_USER=postgres
DATABASE_PASSWORD=password

JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRATION=86400000

SPRING_PROFILES_ACTIVE=dev
Uruchomienie backendu
Maven
mvn clean spring-boot:run

Backend:

http://localhost:8080/api
Docker
Build image
docker build -t lacco-backend .
Run container
docker run -p 8080:8080 lacco-backend
Kubernetes Deployment
Deploy backend
kubectl apply -f k8s/
Sprawdzenie podów
kubectl get pods
Sprawdzenie service
kubectl get svc
CI/CD Pipeline

Pipeline automatycznie:

Buduje aplikację
Uruchamia testy
Buduje Docker image
Pushuje image do registry
Deployuje aplikację na Kubernetes

Pipeline realizowany przez:

GitHub Actions
Monitoring Stack
Prometheus

Zbieranie metryk backendu:

JVM metrics
HTTP metrics
application health
Grafana

Dashboardy:

CPU
RAM
response times
requests/sec
uptime
Alertmanager

Alerty:

backend down,
high memory usage,
pod restart loops,
high response time.
API Endpoints
Authentication
Login
POST /api/auth/login

Request:

{
  "email": "test@example.com",
  "password": "password123"
}

Response:

{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "role": "ADMIN"
  }
}
Profile
GET /api/auth/profile

Headers:

Authorization: Bearer <token>
Logout
POST /api/auth/logout
Database Schema
profiles
id UUID PRIMARY KEY,
first_name VARCHAR,
last_name VARCHAR,
email VARCHAR UNIQUE NOT NULL,
role VARCHAR DEFAULT 'USER',
password_hash VARCHAR NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP,
last_login TIMESTAMP,
is_active BOOLEAN DEFAULT TRUE
Testowanie
Run tests
mvn test
Build production
mvn clean package -DskipTests
Security

Projekt wykorzystuje:

JWT authentication
BCrypt hashing
Role-based authorization
Environment variables
Stateless authentication
Reverse proxy via NGINX
Kubernetes Secrets
Spring Security
Environment Variables
Variable	Description
DATABASE_URL	PostgreSQL URL
DATABASE_USER	Database user
DATABASE_PASSWORD	Database password
JWT_SECRET	JWT signing key
JWT_EXPIRATION	Token expiration
SPRING_PROFILES_ACTIVE	active profile
Roadmap
Backend
 Refresh tokens
 Password reset
 Audit logs
 Swagger/OpenAPI
 RBAC improvements
DevOps
 Helm charts
 ArgoCD
 Blue/Green deployment
 Loki logging
 ELK stack
 Horizontal Pod Autoscaler
 Kubernetes ingress TLS
 SonarQube integration
Production Goals

Projekt ma symulować rzeczywiste środowisko produkcyjne:

automatyczny deployment,
monitoring infrastruktury,
konteneryzację,
separację środowisk,
bezpieczne zarządzanie sekretami,
skalowalność aplikacji.
Author

Mateusz Czarnik

Projekt edukacyjny Fullstack + DevOps portfolio.