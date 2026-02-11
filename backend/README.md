# Smart Vehicle Repair Assistance Platform - Backend

Production-grade Spring Boot backend with MongoDB geospatial queries, WebSocket real-time tracking, and JWT authentication.

## Features

- ✅ JWT Authentication with role-based access control
- ✅ MongoDB with geospatial 2dsphere indexes for 20km radius queries
- ✅ Real-time WebSocket communication for live tracking
- ✅ Transactional auto-delete logic for pending requests
- ✅ Auto-expire scheduler for old requests (15 minutes)
- ✅ SOS emergency system with 30km broadcast
- ✅ Haversine formula for accurate distance calculation
- ✅ Rating and review system
- ✅ Input validation and error handling

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB 6.0+
- Redis 7.0+

## Quick Start

### 1. Install Dependencies

```bash
mvn clean install
```

### 2. Configure Environment

Edit `src/main/resources/application.yml`:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/repair_platform
  redis:
    host: localhost
    port: 6379

jwt:
  secret: your-secret-key-change-this-in-production-min-256-bits
```

### 3. Start MongoDB and Redis

```bash
# MongoDB
mongod --replSet rs0

# Redis
redis-server
```

### 4. Run Application

```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Client Endpoints

- `GET /api/v1/client/nearby-shops` - Get shops within 20km radius
- `GET /api/v1/client/all-shops` - Get all shops (no radius filter)
- `POST /api/v1/client/create-request` - Create repair request
- `POST /api/v1/client/sos` - Create SOS emergency request
- `GET /api/v1/client/my-requests` - Get user's requests
- `POST /api/v1/client/rate-request/:id` - Rate completed request

### Mechanic Endpoints

- `POST /api/v1/mechanic/create-shop` - Create mechanic shop
- `PUT /api/v1/mechanic/update-shop` - Update shop details
- `POST /api/v1/mechanic/toggle-availability` - Toggle availability
- `GET /api/v1/mechanic/incoming-requests` - Get pending requests
- `GET /api/v1/mechanic/active-jobs` - Get accepted jobs
- `GET /api/v1/mechanic/completed-jobs` - Get completed jobs
- `POST /api/v1/mechanic/accept-request/:id` - Accept request (auto-deletes others)
- `POST /api/v1/mechanic/update-status/:id` - Update request status

### WebSocket

- Endpoint: `/ws`
- Events: `location-update`, `subscribe`

## Testing

```bash
# Run all tests
mvn test

# Run specific test
mvn test -Dtest=MechanicServiceTest
```

## Architecture

```
backend/
├── src/main/java/com/roadside/
│   ├── config/          # Security, WebSocket, MongoDB config
│   ├── controller/      # REST and WebSocket controllers
│   ├── dto/             # Data Transfer Objects
│   ├── exception/       # Global exception handler
│   ├── model/           # Entity models
│   ├── repository/      # MongoDB repositories
│   └── service/         # Business logic
└── src/main/resources/
    └── application.yml  # Configuration
```

## Key Features Implementation

### Geospatial Query (20km radius)

```java
@Query("{ 'location': { $near: { $geometry: { type: 'Point', coordinates: [?1, ?0] }, $maxDistance: ?2 } } }")
List<MechanicShop> findNearbyShops(double latitude, double longitude, double maxDistance);
```

### Auto-Delete Logic

```java
@Transactional
public RepairRequest acceptRequest(String userId, String requestId) {
    // Update request
    request.setStatus("ACCEPTED");
    repairRequestRepository.save(request);

    // Delete all other pending requests from same client
    repairRequestRepository.deleteByClientIdAndStatusAndIdNot(
        request.getClientId(), "PENDING", requestId
    );
}
```

### Auto-Expire Scheduler

```java
@Scheduled(fixedDelayString = "${request.scheduler-interval-ms}")
public void expirePendingRequests() {
    LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(15);
    List<RepairRequest> expired = repairRequestRepository
        .findByStatusAndCreatedAtBefore("PENDING", expiryTime);
    // Mark as EXPIRED and notify clients
}
```

## Production Deployment

1. Build JAR:

```bash
mvn clean package
```

2. Run with production profile:

```bash
java -jar target/repair-platform-1.0.0.jar --spring.profiles.active=prod
```

## License

MIT
