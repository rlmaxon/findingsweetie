# Finding Sweetie - Ubuntu Installation Guide

This guide provides step-by-step instructions for installing Finding Sweetie on Ubuntu Linux (bare metal, not containers).

## System Requirements

- **OS**: Ubuntu 20.04 LTS or newer
- **RAM**: Minimum 4GB, recommended 8GB+ (for AI service)
- **Storage**: Minimum 20GB free space
- **Network**: Internet connection for package downloads

## Prerequisites

Before starting, ensure you have:
- Root or sudo access
- Basic knowledge of Linux command line
- A domain name (optional, for production)

## Installation Steps

### Step 1: System Setup

Run the system setup script to install all required dependencies:

```bash
cd /path/to/findingsweetie
sudo ./scripts/setup-system.sh
```

This script installs:
- Node.js 20
- PostgreSQL 15 with PostGIS
- Redis Server
- Python 3.11
- Build tools (gcc, g++, etc.)
- Nginx
- PM2 (process manager)

**Time estimate**: 10-15 minutes

### Step 2: Database Setup

Create and configure the PostgreSQL database:

```bash
# Run as postgres user
sudo -u postgres psql -f scripts/setup-database.sql
```

**Important**: The script creates a default user with password `changeme_in_production`. You should change this:

```bash
sudo -u postgres psql -c "ALTER USER findingsweetie_user WITH PASSWORD 'your_secure_password';"
```

### Step 3: Environment Configuration

Create your environment configuration:

```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

**Required configurations**:

```env
# Database (use the password you set in Step 2)
DB_PASSWORD=your_secure_password

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=your_generated_secret

# AWS S3 (for image storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=your_bucket_name

# Mapbox (for maps)
VITE_MAPBOX_TOKEN=your_mapbox_token

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# SMS (Twilio - optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Application Setup

Install and build the application:

```bash
./scripts/setup-application.sh
```

This script:
- Installs Node.js dependencies for backend and frontend
- Builds the TypeScript backend
- Builds the React frontend
- Creates Python virtual environment for AI service
- Installs Python dependencies
- Configures PM2 process manager
- Sets up Nginx reverse proxy
- Creates log directories

**Time estimate**: 10-20 minutes (depending on download speed)

### Step 5: Set Up Logging

Configure log rotation:

```bash
sudo ./scripts/setup-logs.sh
```

### Step 6: Verify Installation

Check that all services are running:

```bash
pm2 status
```

You should see:
- `findingsweetie-backend` (2 instances in cluster mode)
- `findingsweetie-ai` (1 instance)

Check Nginx status:

```bash
sudo systemctl status nginx
```

Check the application:

```bash
curl http://localhost/api/health
# Should return: {"status":"healthy","timestamp":"..."}

curl http://localhost:8000/health
# Should return AI service health status
```

### Step 7: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **AI Service**: http://localhost:8000

## Service Management

### View Logs

```bash
# All logs
pm2 logs

# Specific service
pm2 logs findingsweetie-backend
pm2 logs findingsweetie-ai

# Nginx logs
sudo tail -f /var/log/nginx/findingsweetie-access.log
sudo tail -f /var/log/nginx/findingsweetie-error.log
```

### Restart Services

```bash
# Restart all services
./scripts/restart.sh

# Restart specific service
pm2 restart findingsweetie-backend
pm2 restart findingsweetie-ai

# Restart Nginx
sudo systemctl restart nginx
```

### Stop Services

```bash
./scripts/stop.sh
```

### Start Services

```bash
pm2 start ecosystem.config.js
sudo systemctl start nginx
```

## Development Mode

For development, you can run services directly without PM2:

```bash
# Start all services in development mode
./scripts/dev.sh

# Or start individually:

# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev

# AI Service (terminal 3)
cd ai-service
source venv/bin/activate
uvicorn src.main:app --reload --port 8000
```

## Production Hardening

### 1. SSL/HTTPS Setup

Install Certbot for Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 2. Firewall Configuration

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 3. Security Updates

Enable automatic security updates:

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 4. Database Backups

Create a backup script:

```bash
#!/bin/bash
# /home/findingsweetie/backup-db.sh

BACKUP_DIR="/var/backups/findingsweetie"
mkdir -p $BACKUP_DIR

pg_dump -U findingsweetie_user findingsweetie | gzip > \
  $BACKUP_DIR/findingsweetie-$(date +%Y%m%d-%H%M%S).sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /home/findingsweetie/backup-db.sh
```

### 5. Monitoring

Install monitoring tools:

```bash
# System monitoring
sudo apt install htop iotop

# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Troubleshooting

### Backend Won't Start

Check logs:
```bash
pm2 logs findingsweetie-backend --lines 100
```

Common issues:
- Database connection failed → Check DB_PASSWORD in .env
- Port already in use → Check if another process is using port 3000

### AI Service Won't Start

Check Python environment:
```bash
cd ai-service
source venv/bin/activate
python -c "import torch; print(torch.__version__)"
```

If packages are missing:
```bash
pip install -r requirements.txt
```

### Frontend Not Loading

Check Nginx:
```bash
sudo nginx -t
sudo systemctl status nginx
```

Verify build:
```bash
ls -la /var/www/findingsweetie/frontend/
```

### Database Connection Issues

Test connection:
```bash
psql -U findingsweetie_user -d findingsweetie -h localhost
```

Check PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

### Redis Connection Issues

Check Redis:
```bash
redis-cli ping
# Should return: PONG
```

## Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild backend
cd backend
npm install
npm run build

# Rebuild frontend
cd ../frontend
npm install
npm run build

# Update AI service
cd ../ai-service
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Copy to production directory
sudo cp -r backend/dist/* /var/www/findingsweetie/backend/dist/
sudo cp -r frontend/dist/* /var/www/findingsweetie/frontend/

# Restart services
./scripts/restart.sh
```

## Uninstalling

```bash
# Stop services
pm2 delete all
sudo systemctl stop nginx

# Remove application files
sudo rm -rf /var/www/findingsweetie

# Drop database (WARNING: This deletes all data!)
sudo -u postgres psql -c "DROP DATABASE findingsweetie;"
sudo -u postgres psql -c "DROP USER findingsweetie_user;"

# Optionally remove packages
sudo apt remove postgresql redis-server nginx
```

## Support

If you encounter issues:

1. Check the logs (`pm2 logs`)
2. Review this documentation
3. Check the main README.md
4. Open an issue on GitHub

## Next Steps

After installation:
1. Create an admin user account
2. Configure email/SMS notifications
3. Set up S3 bucket for image storage
4. Configure Mapbox token for maps
5. Test the complete workflow
6. Set up SSL certificate for production
7. Configure backups
8. Set up monitoring

---

**Installation complete!** You're ready to start using Finding Sweetie to help reunite lost pets with their owners. 🐾
