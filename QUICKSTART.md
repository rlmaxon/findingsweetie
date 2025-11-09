# Finding Sweetie - Quick Start Guide

## TL;DR - Get Running in 15 Minutes

**System Requirements**: Ubuntu 20.04+, 4GB RAM, 10GB disk space (CPU-only) or 20GB (with GPU support)

For those who want to get started quickly on Ubuntu:

```bash
# 1. Clone and enter directory
git clone https://github.com/yourusername/findingsweetie.git
cd findingsweetie

# 2. Install system dependencies (10-15 min)
sudo ./scripts/setup-system.sh

# 3. Setup database (1 min)
sudo -u postgres psql -f scripts/setup-database.sql

# 4. Configure environment (2 min)
cp .env.example .env
nano .env  # Set your credentials (see below)

# 5. Deploy application (5-10 min)
./scripts/setup-application.sh

# 6. Done! Access at http://localhost
```

## Minimum Required Configuration

Edit `.env` file with at least these values:

```env
# Database password (change from default)
DB_PASSWORD=your_secure_password_here

# JWT secret (generate with: openssl rand -hex 32)
JWT_SECRET=paste_generated_secret_here

# Mapbox token (get free at mapbox.com)
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# AWS S3 credentials (create bucket first)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=your_bucket_name

# Email for notifications (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Essential Commands

```bash
# View service status
pm2 status

# View logs
pm2 logs

# Restart everything
./scripts/restart.sh

# Stop everything
./scripts/stop.sh

# Start in dev mode
./scripts/dev.sh
```

## Post-Installation Checklist

- [ ] Change database password from default
- [ ] Set unique JWT secret
- [ ] Configure Mapbox token
- [ ] Set up AWS S3 bucket
- [ ] Configure email SMTP
- [ ] Test application loads at http://localhost
- [ ] Create first user account
- [ ] Register a test pet
- [ ] Submit a test sighting
- [ ] Verify email notifications work

## Getting Credentials

### Mapbox Token (Required for Maps)
1. Go to https://mapbox.com
2. Sign up for free account
3. Get your access token from dashboard
4. Add to `.env` as `VITE_MAPBOX_TOKEN`

### AWS S3 (Required for Image Storage)
1. Log into AWS Console
2. Create S3 bucket: `findingsweetie-images-[yourname]`
3. Create IAM user with S3 access
4. Generate access key/secret
5. Add credentials to `.env`

### Gmail SMTP (For Email Notifications)
1. Use your Gmail account
2. Enable 2-factor authentication
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use app password in `.env` as `SMTP_PASSWORD`

### Twilio SMS (Optional)
1. Sign up at https://twilio.com
2. Get trial account (free)
3. Copy Account SID and Auth Token
4. Add to `.env`

## First User Registration

1. Navigate to http://localhost
2. Click "Register"
3. Fill in your details
4. Submit
5. You'll be automatically logged in

## Common Issues

**Services won't start**
```bash
pm2 logs  # Check for errors
```

**Database connection failed**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check DB_PASSWORD matches what you set

**Frontend shows blank page**
- Check Nginx: `sudo systemctl status nginx`
- Verify build exists: `ls /var/www/findingsweetie/frontend/`

**AI service crashes or out of disk space**
- Check memory: `free -h` (needs 4GB+ RAM)
- Check disk space: `df -h`
- For limited disk space, use CPU-only installation: `cd ai-service && bash install-cpu.sh`
- Verify Python packages: `cd ai-service && source venv/bin/activate && pip list`

## Next Steps

Once running:
1. Review full [INSTALL.md](INSTALL.md) for production hardening
2. Set up SSL certificate
3. Configure firewall
4. Set up automated backups
5. Read [README.md](README.md) for API documentation

## Need Help?

- Full installation guide: [INSTALL.md](INSTALL.md)
- Main documentation: [README.md](README.md)
- Issues: https://github.com/yourusername/findingsweetie/issues

---

**Pro Tip**: Run `pm2 save` after starting services to ensure they auto-start on system reboot.
