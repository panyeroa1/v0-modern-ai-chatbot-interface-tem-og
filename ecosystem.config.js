module.exports = {
  apps: [
    {
      name: 'eburon-ai',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: process.env.PORT || 3000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: process.env.PORT || 3399
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3399
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Restart settings
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: 'your-vps-ip',
      ref: 'origin/main',
      repo: 'https://github.com/panyeroa1/v0-modern-ai-chatbot-interface-tem-og.git',
      path: '/opt/eburon-ai',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    },
    staging: {
      user: 'root',
      host: 'your-staging-ip',
      ref: 'origin/staging',
      repo: 'https://github.com/panyeroa1/v0-modern-ai-chatbot-interface-tem-og.git',
      path: '/opt/eburon-ai-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
