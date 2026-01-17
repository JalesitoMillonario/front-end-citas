# 🚀 Guía de Deploy a VM

Esta guía explica cómo desplegar tu sistema de citas en la VM y mantenerlo actualizado desde GitHub.

## 🏗️ Arquitectura

```
Desarrollo (Local)  →  GitHub  →  VM Producción
                                   ├── Backend (PM2)
                                   ├── Frontend (Nginx)
                                   └── n8n
```

## 📋 Requisitos Previos en la VM

### 1. Instalar Software Necesario

```bash
# Conectar a la VM
ssh usuario@34.57.154.181

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (para mantener backend corriendo)
sudo npm install -g pm2

# Instalar Nginx (para servir frontend)
sudo apt install -y nginx

# Instalar Git
sudo apt install -y git
```

### 2. Configurar Git en la VM

```bash
# Configurar credenciales
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Clonar el repositorio
cd /home/usuario
git clone https://github.com/JalesitoMillonario/front-end-citas.git
cd front-end-citas
```

### 3. Configurar Variables de Entorno

**Backend `.env`:**
```bash
cd /home/usuario/front-end-citas/backend
nano .env
```

Contenido:
```env
PORT=5000
JWT_SECRET=tu_secreto_super_seguro_cambiar_AQUI
DATABASE_PATH=./database/citas.db
N8N_WEBHOOK_URL=http://localhost:5678/webhook/recordatorio-cita
FRONTEND_URL=http://34.57.154.181
REMINDER_HOURS_BEFORE=12
```

**Frontend `.env`:**
```bash
cd /home/usuario/front-end-citas
nano .env
```

Contenido:
```env
VITE_GOOGLE_CLIENT_ID=579969968844-pbdhii42ddbicqsjrcmgkru8siobqkm5.apps.googleusercontent.com
VITE_API_BASE_URL=http://34.57.154.181:5000/api
```

### 4. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

Contenido:
```nginx
server {
    listen 80;
    server_name 34.57.154.181;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API (proxy)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Reiniciar nginx:
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. Iniciar Backend con PM2

```bash
cd /home/usuario/front-end-citas/backend
npm install
pm2 start server.js --name backend-citas
pm2 save
pm2 startup
```

### 6. Build y Deploy del Frontend

```bash
cd /home/usuario/front-end-citas
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

---

## 🔄 Flujo de Trabajo Diario

### En Tu Computadora (Local):

1. **Desarrolla y prueba localmente:**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

2. **Cuando estés satisfecho, haz commit y push:**
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

### En la VM:

3. **Actualiza el código:**
```bash
# SSH a la VM
ssh usuario@34.57.154.181

# Opción A: Deploy backend solamente
cd /home/usuario/front-end-citas
bash deploy/deploy-backend.sh

# Opción B: Deploy frontend solamente
bash deploy/deploy-frontend.sh

# Opción C: Deploy completo (ambos)
bash deploy/deploy-backend.sh && bash deploy/deploy-frontend.sh
```

---

## 🛠️ Scripts de Deploy

### Deploy Backend

```bash
cd /home/usuario/front-end-citas
bash deploy/deploy-backend.sh
```

Esto hace:
- ✅ `git pull` del último código
- ✅ `npm install` de nuevas dependencias
- ✅ Reinicia PM2

### Deploy Frontend

```bash
cd /home/usuario/front-end-citas
bash deploy/deploy-frontend.sh
```

Esto hace:
- ✅ `git pull` del último código
- ✅ `npm install` de nuevas dependencias
- ✅ `npm run build` compilación para producción
- ✅ Copia archivos a `/var/www/html`
- ✅ Recarga nginx

---

## 🔍 Comandos Útiles

### PM2 (Backend)

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs backend-citas

# Ver logs de errores
pm2 logs backend-citas --err

# Reiniciar
pm2 restart backend-citas

# Detener
pm2 stop backend-citas

# Monitorear recursos
pm2 monit
```

### Nginx (Frontend)

```bash
# Ver estado
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Probar configuración
sudo nginx -t
```

### Base de Datos

```bash
# Backup de la base de datos
cd /home/usuario/front-end-citas/backend/database
cp citas.db citas.db.backup-$(date +%Y%m%d)

# Ver tablas
sqlite3 citas.db ".tables"

# Consultar negocios
sqlite3 citas.db "SELECT * FROM negocios;"
```

---

## 🔐 Seguridad

### Firewall

```bash
# Abrir solo puertos necesarios
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS (para el futuro)
sudo ufw enable
```

### SSL (Opcional - Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado (necesitas un dominio)
sudo certbot --nginx -d tudominio.com
```

---

## 🐛 Troubleshooting

### Backend no responde

```bash
# Ver logs
pm2 logs backend-citas

# Reiniciar
pm2 restart backend-citas

# Si falla, matar proceso y reiniciar
pm2 delete backend-citas
cd /home/usuario/front-end-citas/backend
pm2 start server.js --name backend-citas
```

### Frontend muestra error 404

```bash
# Verificar archivos
ls -la /var/www/html/

# Re-deploy
cd /home/usuario/front-end-citas
bash deploy/deploy-frontend.sh
```

### n8n no puede conectarse al backend

```bash
# Verificar que el backend esté corriendo
pm2 status backend-citas

# Verificar puerto
sudo netstat -tulpn | grep 5000

# Probar endpoint
curl http://localhost:5000/api/health
```

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
# CPU y RAM
htop

# Disco
df -h

# PM2 dashboard
pm2 monit
```

### Logs centralizados

```bash
# Backend
pm2 logs backend-citas --lines 100

# Nginx acceso
sudo tail -f /var/log/nginx/access.log

# Nginx errores
sudo tail -f /var/log/nginx/error.log
```

---

## 🚀 Automatización (Opcional)

### Deploy automático con GitHub Webhooks

Si quieres que la VM se actualice automáticamente cuando haces push:

1. **Crear script webhook en la VM:**

```bash
# /home/usuario/webhook-deploy.js
const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

app.post('/webhook/deploy', (req, res) => {
  console.log('🚀 Deploy triggered');

  exec('cd /home/usuario/front-end-citas && bash deploy/deploy-backend.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return res.status(500).send('Deploy failed');
    }
    console.log(stdout);
    res.send('Deploy successful');
  });
});

app.listen(9000, () => console.log('Webhook server running on port 9000'));
```

2. **Iniciar con PM2:**

```bash
pm2 start webhook-deploy.js --name webhook-deploy
pm2 save
```

3. **Configurar en GitHub:**
   - Ve a Settings → Webhooks
   - Add webhook: `http://34.57.154.181:9000/webhook/deploy`
   - Content type: `application/json`
   - Events: `Just the push event`

---

## ✅ Checklist de Deployment

- [ ] VM configurada con Node.js, PM2, Nginx
- [ ] Repositorio clonado en `/home/usuario/front-end-citas`
- [ ] Variables de entorno configuradas (`.env` en backend y frontend)
- [ ] Nginx configurado y corriendo
- [ ] Backend corriendo con PM2
- [ ] Frontend compilado y servido por Nginx
- [ ] n8n puede conectarse al backend (probar con workflow)
- [ ] Firewall configurado
- [ ] Scripts de deploy tienen permisos de ejecución

```bash
chmod +x deploy/deploy-backend.sh
chmod +x deploy/deploy-frontend.sh
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `pm2 logs backend-citas`
2. Verifica la configuración de nginx: `sudo nginx -t`
3. Comprueba que los puertos estén abiertos: `sudo netstat -tulpn`
