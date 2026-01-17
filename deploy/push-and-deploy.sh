#!/bin/bash
# Script para hacer push a GitHub y deploy automático en VM
# Uso: ./deploy/push-and-deploy.sh "mensaje del commit"

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Variables - CONFIGURA ESTAS
VM_HOST="usuario@34.57.154.181"
VM_PATH="/home/usuario/front-end-citas"

# Verificar que se proporcionó un mensaje de commit
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Debes proporcionar un mensaje de commit${NC}"
    echo "Uso: ./deploy/push-and-deploy.sh \"mensaje del commit\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Push & Deploy Automático${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Paso 1: Git add, commit, push
echo -e "${YELLOW}📦 Paso 1/3: Commiteando y pusheando a GitHub...${NC}"
git add .
git commit -m "$COMMIT_MESSAGE"
git push origin main
echo -e "${GREEN}✅ Push exitoso${NC}"
echo ""

# Paso 2: SSH y deploy backend
echo -e "${YELLOW}🔧 Paso 2/3: Desplegando backend en VM...${NC}"
ssh $VM_HOST "cd $VM_PATH && bash deploy/deploy-backend.sh"
echo -e "${GREEN}✅ Backend actualizado${NC}"
echo ""

# Paso 3: Preguntar si quiere deployar frontend
echo -e "${YELLOW}❓ ¿Deseas deployar el frontend también? (s/N)${NC}"
read -r response
if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
    echo -e "${YELLOW}🎨 Paso 3/3: Desplegando frontend en VM...${NC}"
    ssh $VM_HOST "cd $VM_PATH && bash deploy/deploy-frontend.sh"
    echo -e "${GREEN}✅ Frontend actualizado${NC}"
else
    echo -e "${BLUE}⏭️  Frontend no actualizado${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deploy completado exitosamente!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🌐 Accede a tu aplicación:${NC}"
echo -e "   Frontend: ${YELLOW}http://34.57.154.181${NC}"
echo -e "   Backend:  ${YELLOW}http://34.57.154.181:5000/api/health${NC}"
echo ""
