// PM2 Development Ecosystem Configuration
// This config is for local development with apps in /home/user/findingsweetie/
// For production deployment, use ecosystem.config.js instead

module.exports = {
  apps: [
    {
      name: 'findingsweetie-backend',
      script: 'dist/index.js',
      cwd: '/home/user/findingsweetie/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_file: '/home/user/findingsweetie/.env',
      error_file: '/home/user/findingsweetie/logs/backend-error.log',
      out_file: '/home/user/findingsweetie/logs/backend-out.log',
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
      args: 'src.main:app --host 0.0.0.0 --port 8000 --workers 2',
      interpreter: 'none',
      cwd: '/home/user/findingsweetie/ai-service',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 8000,
        PYTHONPATH: '/home/user/findingsweetie/ai-service/src'
      },
      env_file: '/home/user/findingsweetie/.env',
      error_file: '/home/user/findingsweetie/logs/ai-error.log',
      out_file: '/home/user/findingsweetie/logs/ai-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '4G'
    }
  ]
};
