#!/bin/bash

echo "=== Restarting Finding Sweetie Services ==="

# Restart PM2 processes
echo "Restarting PM2 processes..."
sudo -u findingsweetie pm2 restart all

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Services restarted."
echo ""
echo "Status:"
pm2 status
