#!/bin/bash
set -e

echo "=== Setting up Finding Sweetie Application ==="
echo ""

APP_DIR="/var/www/findingsweetie"
CURRENT_DIR=$(pwd)

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Backend setup
echo "Setting up backend..."
cd backend
npm install
npm run build
cd ..

# Frontend setup
echo "Setting up frontend..."
cd frontend
npm install
npm run build
cd ..

# AI Service setup
echo "Setting up AI service..."
cd ai-service
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
# Use CPU-only installation to reduce disk space requirements
echo "Installing CPU-only PyTorch packages (saves 2-3GB)..."
bash install-cpu.sh
deactivate
cd ..

# Copy files to application directory
echo "Copying files to application directory..."
sudo mkdir -p $APP_DIR
sudo cp -r backend $APP_DIR/
sudo cp -r frontend/dist $APP_DIR/frontend
sudo cp -r ai-service $APP_DIR/
sudo cp .env $APP_DIR/
sudo chown -R findingsweetie:findingsweetie $APP_DIR

# Setup PM2 ecosystem
echo "Setting up PM2 processes..."
sudo -u findingsweetie pm2 delete all || true
sudo -u findingsweetie pm2 start ecosystem.config.js
sudo -u findingsweetie pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u findingsweetie --hp /home/findingsweetie

# Setup Nginx
echo "Configuring Nginx..."
sudo cp scripts/nginx.conf /etc/nginx/sites-available/findingsweetie
sudo ln -sf /etc/nginx/sites-available/findingsweetie /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "=== Application Setup Complete ==="
echo ""
echo "Services status:"
pm2 status
echo ""
echo "Application URLs:"
echo "  - Frontend: http://localhost"
echo "  - Backend API: http://localhost:3000"
echo "  - AI Service: http://localhost:8000"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs"
echo "  - Restart services: pm2 restart all"
echo "  - Stop services: pm2 stop all"
echo ""
