module.exports = {
  apps: [
    {
      name: 'portal-keasramaan',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/portal-keasramaan',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
