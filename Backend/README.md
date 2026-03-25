# Lacco Backend

Spring Boot 3 + Spring Security + JWT aplikacja do zarządzania sprzedażą.

## Technologie

- **Java 17**
- **Spring Boot 4.0.4**
- **Spring Security + JWT (JJWT)**
- **Spring Data JPA**
- **PostgreSQL** (Supabase)
- **Lombok**
- **MapStruct**
- **Testcontainers**

## Setup

### 1. Wymagania

- Java 17+
- Maven 3.8+
- PostgreSQL (lub Supabase)

### 2. Konfiguracja

Skopiuj `.env.example` na `.env`:
```bash
cp .env.example .env
```

Zaktualizuj zmienne:
```
DATABASE_URL=jdbc:postgresql://your-host:5432/lacco
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRATION=86400000
```

### 3. Uruchom aplikację

```bash
mvn clean spring-boot:run
```

Serwer będzie dostępny na `http://localhost:8080/api`

## Architektura

```
src/main/java/com/example/Lacco/
├── controller/
│   └── AuthController.java          # Login, profile, logout endpoints
├── service/
│   └── AuthService.java             # Authentication business logic
├── repository/
│   └── ProfileRepository.java       # Database access
├── model/
│   ├── entity/
│   │   └── Profile.java             # JPA entity (profiles table)
│   └── dto/
│       ├── LoginRequest.java        # Login DTO
│       └── LoginResponse.java       # Login response DTO
├── config/
│   ├── SecurityConfig.java          # Spring Security config
│   ├── JwtProvider.java             # JWT token generation/validation
│   ├── JwtFilter.java               # JWT filter for requests
│   └── CustomUserDetailsService.java
├── exception/
│   ├── AuthenticationException.java
│   └── GlobalExceptionHandler.java  # Global exception handling
└── LaccoApplication.java            # Main app class
```

## API Endpoints

### Authentication

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "role": "ADMIN"
  }
}
```

#### Get Current User Profile
```bash
GET /api/auth/profile
Authorization: Bearer <token>

Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "role": "ADMIN"
}
```

#### Logout
```bash
POST /api/auth/logout
Authorization: Bearer <token>
```

## Test User

Email: `test@example.com`
Password: `password123`

**⚠️ Zmień to przed deployal!**

## Database Schema

### profiles table

```sql
id (UUID) PRIMARY KEY
first_name (VARCHAR)
last_name (VARCHAR)
email (VARCHAR) NOT NULL UNIQUE
role (VARCHAR) DEFAULT 'USER'
created_at (TIMESTAMP) DEFAULT CURRENT_TIMESTAMP
fcm_token (VARCHAR)
password_hash (VARCHAR) NOT NULL
is_active (BOOLEAN) DEFAULT TRUE
last_login (TIMESTAMP)
updated_at (TIMESTAMP)
```

## Security

- ✅ BCrypt password hashing
- ✅ JWT token authentication
- ✅ CORS configured
- ✅ CSRF disabled (stateless API)
- ✅ Role-based access control

## Available Commands

```bash
# Build project
mvn clean package

# Run tests
mvn test

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Build prod image
mvn clean package -DskipTests
```

## Integração z Frontendem

Frontend wysyła JWT token w Authorization header:
```
Authorization: Bearer <token>
```

Każdy request (poza login) wymaga tego headera.

Na 401 (unauthorized) frontend usuwę token z localStorage i redirectuje do loginu.

## Environment Variables

```
DATABASE_URL          - PostgreSQL connection URL
DATABASE_USER         - Database user
DATABASE_PASSWORD     - Database password
JWT_SECRET           - Secret key for JWT (min 32 chars)
JWT_EXPIRATION       - Token expiration time in ms (default: 24h)
SPRING_PROFILES_ACTIVE - dev/prod profile
```

## TODO

- [ ] Implement Profile service (update, delete)
- [ ] Add refresh token endpoint
- [ ] Implement password reset flow
- [ ] Add audit logging
- [ ] Create comprehensive test suite
- [ ] Add Swagger/OpenAPI documentation
- [ ] Implement role-based authorization
