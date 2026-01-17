#!/bin/bash
# Script para actualizar el frontend en la VM

set -e  # Salir si hay error

echo "🚀 Desplegando Frontend en VM..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ir al directorio del proyecto
cd /home/usuario/front-end-citas

# Pull último código
echo -e "${BLUE}📥 Descargando últimos cambios...${NC}"
git pull origin main

# Ir al directorio del frontend
cd frontend

# Instalar dependencias
echo -e "${BLUE}📦 Instalando dependencias...${NC}"
npm install

# Build de producción
echo -e "${BLUE}🏗️  Compilando para producción...${NC}"
npm run build

# Copiar archivos a nginx
echo -e "${BLUE}📂 Copiando archivos a nginx...${NC}"
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# Recargar nginx
echo -e "${BLUE}🔄 Recargando nginx...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}✅ Frontend actualizado exitosamente!${NC}"
echo ""
echo "🌐 Accede en: http://34.57.154.181"
