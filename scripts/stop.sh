#!/bin/bash

echo "=== Stopping Finding Sweetie Services ==="

# Stop PM2 processes
echo "Stopping PM2 processes..."
sudo -u findingsweetie pm2 stop all

# Stop Nginx
echo "Stopping Nginx..."
sudo systemctl stop nginx

echo "All services stopped."
