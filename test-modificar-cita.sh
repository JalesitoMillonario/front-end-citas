#!/bin/bash

API_KEY="f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788"
BASE_URL="http://34.57.154.181:5000"

echo "=== PASO 1: Crear una cita de prueba ==="
curl -X POST "${BASE_URL}/api/n8n/citas/crear" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "María García",
    "cliente_telefono": "+34612345678",
    "cliente_email": "maria@test.com",
    "servicio_id": "563e5cc9-ff3c-4e7e-ba35-4d797017e32a",
    "fecha": "2026-01-21",
    "hora": "10:00",
    "notas": "Cita de prueba",
    "created_by": "test"
  }'

echo -e "\n\n=== PASO 2: Esperar 2 segundos ==="
sleep 2

echo -e "\n=== PASO 3: Modificar la cita ==="
curl -X PUT "${BASE_URL}/api/n8n/citas/modificar-por-telefono" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+34612345678",
    "fecha_actual": "2026-01-21",
    "hora_actual": "10:00",
    "nueva_fecha": "2026-01-23",
    "nueva_hora": "14:00",
    "nuevo_servicio_id": "563e5cc9-ff3c-4e7e-ba35-4d797017e32a"
  }'

echo -e "\n\n✅ Test completado"
