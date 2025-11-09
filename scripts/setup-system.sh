#!/bin/bash
set -e

echo "=== Finding Sweetie - Ubuntu Setup Script ==="
echo ""

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Install PostgreSQL with PostGIS
echo "Installing PostgreSQL with PostGIS..."
sudo apt install -y postgresql postgresql-contrib postgis postgresql-15-postgis-3

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Redis
echo "Installing Redis..."
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install Python 3.11
echo "Installing Python 3.11..."
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install build tools
echo "Installing build tools..."
sudo apt install -y build-essential libpq-dev nginx

# Install PM2 for process management
echo "Installing PM2..."
sudo npm install -g pm2

# Create application user
echo "Creating application user..."
if ! id "findingsweetie" &>/dev/null; then
    sudo useradd -m -s /bin/bash findingsweetie
fi

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /var/www/findingsweetie
sudo chown -R findingsweetie:findingsweetie /var/www/findingsweetie

echo ""
echo "=== System Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Set up the database: sudo -u postgres psql -f scripts/setup-database.sql"
echo "2. Configure environment: cp .env.example .env && nano .env"
echo "3. Run application setup: ./scripts/setup-application.sh"
echo ""
