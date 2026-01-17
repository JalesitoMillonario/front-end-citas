// IMPORTANTE: Actualiza PROJECT_DIR con la ruta correcta de tu proyecto
const PROJECT_DIR = process.env.PROJECT_DIR || '/home/jalesitomillonario/app/front-end-citas-claude-explain-codebase-mkgq7tl6s7o5ocfc-tclhN';

module.exports = {
  apps: [
    {
      name: 'citas-backend',
      script: './backend/server.js',
      cwd: PROJECT_DIR,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'citas-frontend',
      script: 'serve',
      args: '-s dist -l 5173 -n',
      cwd: PROJECT_DIR,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    }
  ]
};
