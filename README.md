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
- Ubuntu Linux (bare metal deployment)
- PM2 process manager
- GitHub Actions CI/CD
- Nginx reverse proxy

## Getting Started

### Prerequisites

**System Requirements**
- Ubuntu 20.04 LTS or newer
- 4GB RAM minimum (8GB+ recommended)
- 20GB free disk space
- Sudo/root access

**External Services**
- AWS account (for S3 image storage)
- Mapbox account (for maps)
- SMTP account (for email notifications)
- Twilio account (optional, for SMS)

### Quick Start (Ubuntu Linux)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/findingsweetie.git
cd findingsweetie
```

2. **Run system setup**
```bash
sudo ./scripts/setup-system.sh
```
This installs Node.js, PostgreSQL, Redis, Python, and other dependencies.

3. **Set up database**
```bash
sudo -u postgres psql -f scripts/setup-database.sql
```

4. **Configure environment**
```bash
cp .env.example .env
nano .env  # Edit with your credentials
```

5. **Install and deploy application**
```bash
./scripts/setup-application.sh
```

6. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:3000
- AI Service: http://localhost:8000

**📖 For detailed installation instructions, see [INSTALL.md](INSTALL.md)**

### Development Mode

Start all services in development mode:

```bash
./scripts/dev.sh
```

Or start services individually:

**Backend**
```bash
cd backend
npm install
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**AI Service**
```bash
cd ai-service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

### Production Management

**Start services**
```bash
pm2 start ecosystem.config.js
sudo systemctl start nginx
```

**Stop services**
```bash
./scripts/stop.sh
```

**Restart services**
```bash
./scripts/restart.sh
```

**View logs**
```bash
pm2 logs
pm2 logs findingsweetie-backend
pm2 logs findingsweetie-ai
```

**Monitor services**
```bash
pm2 status
pm2 monit
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

### Ubuntu Production Deployment

See [INSTALL.md](INSTALL.md) for complete installation guide.

**Quick deployment steps:**

1. Install system dependencies: `sudo ./scripts/setup-system.sh`
2. Configure database: `sudo -u postgres psql -f scripts/setup-database.sql`
3. Configure environment: `cp .env.example .env && nano .env`
4. Deploy application: `./scripts/setup-application.sh`
5. Set up SSL: `sudo certbot --nginx -d yourdomain.com`
6. Configure firewall: `sudo ufw allow 80,443/tcp && sudo ufw enable`

### Production Hardening

**SSL/HTTPS**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**Firewall**
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

**Automated Backups**
```bash
# Create backup script
cat > /home/findingsweetie/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/findingsweetie"
mkdir -p $BACKUP_DIR
pg_dump -U findingsweetie_user findingsweetie | gzip > \
  $BACKUP_DIR/findingsweetie-$(date +%Y%m%d-%H%M%S).sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x /home/findingsweetie/backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/findingsweetie/backup-db.sh") | crontab -
```

### Monitoring

```bash
# System resources
htop

# Service status
pm2 status
pm2 monit

# Logs
pm2 logs --lines 100
tail -f /var/log/nginx/findingsweetie-access.log
```

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
