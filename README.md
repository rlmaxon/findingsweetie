# Finding Sweetie 🐾

**Finding Sweetie** is an AI-assisted lost pet recovery platform designed to help owners locate missing animals using visual recognition, map clustering, and crowd engagement. The system integrates user-submitted sightings, social amplification, and machine learning to streamline the search process.

![Finding Sweetie](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Pet Registration**: Create comprehensive profiles with photos, microchip IDs, and last known locations
- **AI-Powered Matching**: Advanced image similarity detection using MobileNetV3 to match sightings with lost pets
- **Interactive Map**: Real-time visualization of lost pets and sightings using Mapbox GL JS
- **Crowd Engagement**: Allow anyone to report sightings with photos and location data
- **Smart Notifications**: Automatic alerts via email and SMS when high-confidence matches are detected
- **Social Sharing**: One-click sharing to Facebook, Twitter, Reddit with QR code generation
- **Geospatial Search**: PostGIS-powered location queries to find pets within customizable radius
- **Analytics Dashboard**: Track search efforts and sighting patterns

## Architecture

### Tech Stack

**Frontend**
- React 18 with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- Mapbox GL JS for geospatial visualization
- Vite for blazing-fast builds

**Backend**
- Node.js + Express
- PostgreSQL with PostGIS extension
- TypeScript
- JWT authentication
- AWS S3 for image storage

**AI Service**
- Python 3.11 + FastAPI
- PyTorch + MobileNetV3
- Redis caching for performance
- Image similarity scoring

**Infrastructure**
- Docker & Docker Compose
- GitHub Actions CI/CD
- Nginx reverse proxy

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+ with PostGIS
- Redis 7+
- AWS account (for S3)
- Mapbox account (for maps)
- Twilio account (optional, for SMS)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/findingsweetie.git
cd findingsweetie
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Initialize database**
```bash
docker-compose exec database psql -U postgres -d findingsweetie -f /docker-entrypoint-initdb.d/schema.sql
```

5. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:3000
- AI Service: http://localhost:8000

### Manual Setup (Development)

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Configure your .env file with Mapbox token
npm run dev
```

#### AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configure your .env file
uvicorn src.main:app --reload --port 8000
```

#### Database Setup

```bash
# Create database
createdb findingsweetie

# Enable PostGIS extension
psql -d findingsweetie -c "CREATE EXTENSION postgis;"

# Run schema
psql -d findingsweetie -f database/schema.sql
```

## Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=findingsweetie
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=your_bucket_name
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_DEFAULT_CENTER_LAT=37.7749
VITE_DEFAULT_CENTER_LNG=-122.4194
```

#### AI Service (.env)
```env
PORT=8000
REDIS_HOST=localhost
REDIS_PORT=6379
DB_HOST=localhost
DB_NAME=findingsweetie
CONFIDENCE_THRESHOLD=0.78
```

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Pets

#### Create Pet
```http
POST /api/pets
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "color": "Golden",
  "age": 3,
  "pet_type": "dog"
}
```

#### Mark as Lost
```http
POST /api/pets/{id}/lost
Authorization: Bearer {token}
Content-Type: application/json

{
  "last_seen_date": "2024-01-15T14:30:00Z",
  "last_seen_location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "last_seen_address": "123 Main St, San Francisco, CA",
  "search_radius_miles": 5
}
```

### Sightings

#### Report Sighting
```http
POST /api/sightings
Content-Type: application/json

{
  "photo": "https://s3.amazonaws.com/bucket/photo.jpg",
  "description": "Saw a golden retriever near the park",
  "location": {
    "latitude": 37.7750,
    "longitude": -122.4195
  },
  "location_address": "Golden Gate Park"
}
```

### AI Matching

#### Match Images
```http
POST /api/match
Content-Type: application/json

{
  "pet_id": 1,
  "sighting_id": 5,
  "pet_image_url": "https://...",
  "sighting_image_url": "https://..."
}

Response:
{
  "confidence": 0.89,
  "match": true,
  "model_version": "mobilenetv3_1.0"
}
```

## Database Schema

### Key Tables

- **users**: User accounts and authentication
- **pets**: Pet profiles and registration data
- **sightings**: Reported sightings with photos and locations
- **notifications**: Email/SMS notification records
- **watchers**: Users monitoring specific areas
- **ai_match_cache**: Cached AI matching results
- **social_shares**: Social media share tracking

### Geospatial Functions

```sql
-- Find lost pets within radius
SELECT * FROM find_lost_pets_nearby(
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
  radius_miles
);

-- Find sightings near a location
SELECT * FROM find_nearby_sightings(
  pet_location,
  radius_miles
);
```

## Deployment

### Production Deployment with Docker

```bash
# Build and deploy
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale ai-service=3
```

### AWS Deployment

1. **Set up ECS cluster**
2. **Configure RDS PostgreSQL with PostGIS**
3. **Set up ElastiCache Redis**
4. **Configure S3 bucket for images**
5. **Deploy containers to ECS**
6. **Configure ALB for load balancing**

### Environment-Specific Configs

- **Development**: `docker-compose.yml`
- **Staging**: `docker-compose.staging.yml`
- **Production**: `docker-compose.prod.yml`

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### AI Service Tests
```bash
cd ai-service
pytest
```

## CI/CD Pipeline

GitHub Actions automatically:
- Runs tests on pull requests
- Builds Docker images
- Deploys to staging on merge to develop
- Deploys to production on merge to main

## Performance Optimization

- **Caching**: Redis caching for AI match results
- **Database**: Indexed queries with PostGIS spatial indexes
- **CDN**: CloudFront for static assets
- **Image Optimization**: Client-side compression before upload
- **API**: Rate limiting and request throttling

## Security

- **Authentication**: JWT with secure secret rotation
- **Authorization**: Role-based access control
- **Data Encryption**: HTTPS/TLS for all communications
- **Input Validation**: Express-validator on all endpoints
- **CORS**: Configured for specific origins
- **Rate Limiting**: DDoS protection
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content Security Policy headers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs.findingsweetie.com](https://docs.findingsweetie.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/findingsweetie/issues)
- **Email**: support@findingsweetie.com

## Roadmap

- [ ] Mobile apps (iOS & Android)
- [ ] Drone integration for area scanning
- [ ] Blockchain-based proof of ownership
- [ ] Community reward system
- [ ] Local animal shelter data sync
- [ ] Multi-language support
- [ ] Voice-based sighting reports

## Acknowledgments

- MobileNetV3 model from PyTorch
- Mapbox for geospatial visualization
- PostGIS for spatial database capabilities
- The open-source community

---

**Made with ❤️ for pet owners everywhere**
