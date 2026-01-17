#!/bin/bash

# 🚀 Deploy Frontend + Backend con PM2
# Este script construye el frontend y despliega todo con PM2

set -e  # Salir si hay algún error

echo "🏗️  Desplegando aplicación con PM2..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="/home/user/front-end-citas"
cd "$PROJECT_DIR"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo "Asegúrate de estar en el directorio correcto del proyecto"
    exit 1
fi

# 1. Instalar serve si no está instalado
echo -e "${BLUE}📦 Verificando dependencias...${NC}"
if ! command -v serve &> /dev/null; then
    echo "Instalando 'serve' globalmente..."
    npm install -g serve
fi

# 2. Instalar dependencias del frontend
echo -e "${BLUE}📦 Instalando dependencias del frontend...${NC}"
npm install

# 3. Construir el frontend
echo -e "${BLUE}🏗️  Construyendo frontend para producción...${NC}"
npm run build

# Verificar que se creó la carpeta dist
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: No se generó la carpeta dist${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend construido exitosamente${NC}"
echo ""

# 4. Instalar dependencias del backend
echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install
cd ..

# 5. Crear directorio de logs si no existe
echo -e "${BLUE}📁 Creando directorio de logs...${NC}"
mkdir -p logs

# 6. Detener procesos PM2 existentes
echo -e "${YELLOW}🛑 Deteniendo procesos existentes...${NC}"
pm2 delete all || true

# Asegurarse de que no haya procesos huérfanos
pkill -f "node.*server.js" || true
pkill -f "serve" || true
sleep 2

# 7. Iniciar aplicaciones con PM2
echo -e "${GREEN}🚀 Iniciando aplicaciones con PM2...${NC}"
pm2 start ecosystem.config.js

# 8. Guardar configuración de PM2
echo -e "${BLUE}💾 Guardando configuración de PM2...${NC}"
pm2 save

# 9. Configurar PM2 para inicio automático
echo -e "${BLUE}⚙️  Configurando inicio automático...${NC}"
pm2 startup || true

echo ""
echo -e "${GREEN}✅ ¡Despliegue completado!${NC}"
echo ""
echo -e "${BLUE}📊 Estado de las aplicaciones:${NC}"
pm2 status

echo ""
echo -e "${BLUE}🔗 URLs de acceso:${NC}"
echo -e "  Frontend: ${GREEN}http://34.57.154.181.sslip.io:5173${NC}"
echo -e "  Backend:  ${GREEN}http://34.57.154.181:5000/api/health${NC}"
echo ""
echo -e "${YELLOW}📝 Comandos útiles:${NC}"
echo -e "  Ver logs backend:   ${BLUE}pm2 logs citas-backend${NC}"
echo -e "  Ver logs frontend:  ${BLUE}pm2 logs citas-frontend${NC}"
echo -e "  Ver todos los logs: ${BLUE}pm2 logs${NC}"
echo -e "  Estado de PM2:      ${BLUE}pm2 status${NC}"
echo -e "  Reiniciar todo:     ${BLUE}pm2 restart all${NC}"
echo -e "  Detener todo:       ${BLUE}pm2 stop all${NC}"
echo -e "  Ver monitoreo:      ${BLUE}pm2 monit${NC}"
echo ""
