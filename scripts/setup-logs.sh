#!/bin/bash

echo "=== Creating log directories ==="

# Create log directory
sudo mkdir -p /var/log/findingsweetie
sudo chown -R findingsweetie:findingsweetie /var/log/findingsweetie

# Create logrotate configuration
sudo tee /etc/logrotate.d/findingsweetie > /dev/null <<EOF
/var/log/findingsweetie/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 findingsweetie findingsweetie
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

echo "Log rotation configured."
