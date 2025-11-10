// PM2 Production Ecosystem Configuration
// This config is for production deployments with apps in /var/www/findingsweetie/
// For development, use ecosystem.dev.config.js instead

module.exports = {
  apps: [
    {
      name: 'findingsweetie-backend',
      script: 'dist/index.js',
      cwd: '/var/www/findingsweetie/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_file: '/var/www/findingsweetie/.env',
      error_file: '/var/log/findingsweetie/backend-error.log',
      out_file: '/var/log/findingsweetie/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    {
      name: 'findingsweetie-ai',
      script: 'venv/bin/uvicorn',
      args: 'src.main:app --host 0.0.0.0 --port 8000 --workers 4',
      cwd: '/var/www/findingsweetie/ai-service',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 8000,
        PYTHONPATH: '/var/www/findingsweetie/ai-service'
      },
      env_file: '/var/www/findingsweetie/.env',
      error_file: '/var/log/findingsweetie/ai-error.log',
      out_file: '/var/log/findingsweetie/ai-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '4G'
    }
  ]
};
