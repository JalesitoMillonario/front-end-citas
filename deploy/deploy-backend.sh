#!/bin/bash
# Script para actualizar el backend en la VM

set -e  # Salir si hay error

echo "🚀 Desplegando Backend en VM..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ir al directorio del backend
cd /home/usuario/front-end-citas/backend

# Pull último código
echo -e "${BLUE}📥 Descargando últimos cambios...${NC}"
git pull origin main

# Instalar dependencias si hay cambios en package.json
echo -e "${BLUE}📦 Instalando dependencias...${NC}"
npm install --production

# Reiniciar con PM2
echo -e "${BLUE}🔄 Reiniciando backend...${NC}"
pm2 restart backend-citas || pm2 start server.js --name backend-citas

# Mostrar estado
pm2 status backend-citas

echo -e "${GREEN}✅ Backend actualizado exitosamente!${NC}"
echo ""
echo "🔍 Ver logs:"
echo "   pm2 logs backend-citas"
