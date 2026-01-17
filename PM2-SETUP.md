# 🚀 Configuración PM2 para Producción

## ¿Qué es PM2?

PM2 es un gestor de procesos para Node.js que mantiene tus aplicaciones corriendo 24/7, las reinicia automáticamente si fallan, y facilita el despliegue en producción.

## 📦 Instalación de PM2

Si no tienes PM2 instalado:

```bash
npm install -g pm2
```

## 🚀 Despliegue Rápido

### Opción 1: Script Automático (Recomendado)

```bash
cd /home/user/front-end-citas
./deploy-pm2.sh
```

Este script hace todo automáticamente:
1. ✅ Instala dependencias
2. ✅ Construye el frontend para producción
3. ✅ Detiene procesos anteriores
4. ✅ Inicia backend y frontend con PM2
5. ✅ Configura logs
6. ✅ Guarda la configuración

### Opción 2: Manual

```bash
# 1. Construir frontend
npm run build

# 2. Instalar dependencias backend
cd backend && npm install && cd ..

# 3. Instalar 'serve' si no lo tienes
npm install -g serve

# 4. Iniciar con PM2
pm2 start ecosystem.config.js

# 5. Guardar configuración
pm2 save

# 6. Configurar inicio automático
pm2 startup
```

## 📊 Comandos PM2

### Ver Estado
```bash
pm2 status              # Ver estado de todas las apps
pm2 monit               # Monitor en tiempo real
pm2 list                # Lista de procesos
```

### Ver Logs
```bash
pm2 logs                # Todos los logs en tiempo real
pm2 logs citas-backend  # Solo logs del backend
pm2 logs citas-frontend # Solo logs del frontend
pm2 flush               # Limpiar todos los logs
```

### Controlar Procesos
```bash
pm2 restart all         # Reiniciar todo
pm2 restart citas-backend   # Reiniciar solo backend
pm2 restart citas-frontend  # Reiniciar solo frontend
pm2 stop all            # Detener todo
pm2 start all           # Iniciar todo
pm2 delete all          # Eliminar todos los procesos
```

### Recargar Después de Cambios
```bash
# Si cambias código del backend:
git pull
cd backend && npm install && cd ..
pm2 restart citas-backend

# Si cambias código del frontend:
git pull
npm install
npm run build
pm2 restart citas-frontend
```

## 📁 Estructura de Archivos

```
/home/user/front-end-citas/
├── ecosystem.config.js          # Configuración de PM2
├── deploy-pm2.sh               # Script de despliegue automático
├── dist/                       # Frontend construido (generado)
├── logs/                       # Logs de PM2
│   ├── backend-error.log       # Errores del backend
│   ├── backend-out.log         # Output del backend
│   ├── frontend-error.log      # Errores del frontend
│   └── frontend-out.log        # Output del frontend
└── backend/
    └── database/
        └── citas.db            # Base de datos SQLite
```

## 🔍 Verificar que Funciona

### 1. Verificar Estado de PM2
```bash
pm2 status
```

Deberías ver:
```
┌────┬────────────────────┬─────────┬─────────┬──────────┐
│ id │ name               │ status  │ restart │ uptime   │
├────┼────────────────────┼─────────┼─────────┼──────────┤
│ 0  │ citas-backend      │ online  │ 0       │ 2m       │
│ 1  │ citas-frontend     │ online  │ 0       │ 2m       │
└────┴────────────────────┴─────────┴─────────┴──────────┘
```

### 2. Verificar Backend
```bash
curl http://34.57.154.181:5000/api/health
```

Debería responder:
```json
{
  "status": "ok",
  "timestamp": "2026-01-17T...",
  "uptime": 123.45
}
```

### 3. Verificar Frontend
Abre en tu navegador:
```
http://34.57.154.181.sslip.io:5173
```

### 4. Verificar Servicios en Base de Datos
```bash
cd /home/user/front-end-citas/backend
node -e "
const Database = require('better-sqlite3');
const db = new Database('./database/citas.db');
const servicios = db.prepare('SELECT servicio_id, nombre, precio, duracion FROM servicios').all();
console.table(servicios);
db.close();
"
```

## ❌ Solución de Problemas

### Problema: "Servicio no encontrado" en n8n

**Causa:** Backend puede estar usando base de datos vacía o equivocada

**Solución:**
```bash
# 1. Verificar qué base de datos tiene servicios
cd /home/user/front-end-citas/backend
node scripts/seed-servicios.js

# 2. Reiniciar backend con la base de datos correcta
pm2 restart citas-backend

# 3. Verificar logs
pm2 logs citas-backend --lines 50
```

### Problema: Frontend no carga

**Causa:** Carpeta `dist` no existe o está vacía

**Solución:**
```bash
cd /home/user/front-end-citas
npm run build
pm2 restart citas-frontend
```

### Problema: PM2 no arranca al reiniciar el servidor

**Solución:**
```bash
# Configurar PM2 para arrancar automáticamente
pm2 startup
pm2 save

# Copiar y ejecutar el comando que te muestra PM2
```

### Problema: Puerto 5173 ya en uso

**Solución:**
```bash
# Matar proceso en puerto 5173
lsof -ti:5173 | xargs kill -9

# O usar otro puerto editando ecosystem.config.js
# Cambiar: args: '-s dist -l 5173 -n'
# Por:     args: '-s dist -l 3000 -n'
```

### Ver logs en tiempo real para debug

```bash
# Terminal 1: Logs del backend
pm2 logs citas-backend

# Terminal 2: Logs del frontend
pm2 logs citas-frontend
```

## 🔄 Actualizar Después de Cambios en Git

```bash
# Script completo de actualización
cd /home/user/front-end-citas
git pull
./deploy-pm2.sh
```

O manualmente:
```bash
cd /home/user/front-end-citas
git pull
npm install
npm run build
cd backend && npm install && cd ..
pm2 restart all
```

## 🎯 Workflow n8n Después del Deploy

Una vez que PM2 esté corriendo:

1. **Verificar que el backend responde:**
   ```bash
   curl http://34.57.154.181:5000/api/n8n/servicios/listar \
     -H "X-API-Key: f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788"
   ```

2. **Importar workflow en n8n:**
   - Archivo: `n8n-workflows/crear-cita-produccion.json`
   - URL: http://34.57.154.181:5678

3. **Ejecutar workflow:**
   - Clic en "Execute Workflow"
   - Verificar resultado en nodo "Formatear Resultado"

## 📱 URLs Finales

| Servicio | URL |
|----------|-----|
| **Frontend** | http://34.57.154.181.sslip.io:5173 |
| **Backend API** | http://34.57.154.181:5000/api |
| **Health Check** | http://34.57.154.181:5000/api/health |
| **n8n** | http://34.57.154.181:5678 |

## 🔐 Credenciales

- **API Key:** `f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788`
- **Tenant ID:** `f0db1afa-6f46-461d-95a9-65aed91f66ca`

## 💡 Tips

- **Monitoreo:** Usa `pm2 monit` para ver uso de CPU/RAM en tiempo real
- **Logs persistentes:** Los logs se guardan en `/home/user/front-end-citas/logs/`
- **Reinicio cero downtime:** PM2 reinicia automáticamente si hay un crash
- **Startup automático:** Con `pm2 startup` + `pm2 save`, las apps arrancan al reiniciar el servidor
