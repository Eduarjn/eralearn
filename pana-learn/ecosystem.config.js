module.exports = {
  apps: [
    {
      name: 'eralearn',
      script: 'npm',
      args: 'run preview',
      cwd: '/var/www/eralearn',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/eralearn-error.log',
      out_file: '/var/log/pm2/eralearn-out.log',
      log_file: '/var/log/pm2/eralearn-combined.log',
      time: true
    }
  ]
};
