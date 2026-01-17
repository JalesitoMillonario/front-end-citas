# 🏗️ Arquitectura Multi-Tenant API

## 📖 Conceptos Clave

### 1. ¿Qué es Multi-Tenant?
Tu sistema permite que **múltiples negocios** usen la misma aplicación, pero **cada uno ve solo SUS datos**.

```
┌─────────────────────────────────────────────────────────┐
│  MISMA APLICACIÓN                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Estética A  │  │ Peluquería B│  │  Clínica C  │    │
│  │             │  │             │  │             │    │
│  │ 50 citas    │  │ 30 citas    │  │ 100 citas   │    │
│  │ 20 clientes │  │ 15 clientes │  │ 50 clientes │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
│  DATOS COMPLETAMENTE SEPARADOS                          │
└─────────────────────────────────────────────────────────┘
```

### 2. Identificadores Únicos por Negocio

Cuando te registras, el sistema crea:

| Campo | Ejemplo | Uso |
|-------|---------|-----|
| `tenant_id` | f0db1afa-6f46-461d-95a9-65aed91f66ca | Identificador interno único |
| `api_key` | 3c2b319de20b9f5a95d6623b7e65efda21cd5f0f... | Clave para n8n/bots |
| `email` | tu@email.com | Login con Google |

## 🔐 Dos Tipos de Autenticación

### A) Frontend (Usuario Humano)

**Flujo de Login:**
```
Usuario → Google Login → Backend verifica → Genera JWT Token
                                          ↓
                        Token válido por 7 días
                                          ↓
                        Frontend guarda en localStorage
                                          ↓
              Cada petición incluye: Authorization: Bearer <token>
```

**Headers que envía el Frontend:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: f0db1afa-6f46-461d-95a9-65aed91f66ca
```

**Middleware en Backend:** `verifyTenant`
- Lee el `X-Tenant-Id` del header
- Verifica que el token JWT es válido
- Asigna `req.tenantId` para usar en controllers

### B) n8n / Bots (Automatización)

**Flujo de API:**
```
n8n → POST /api/n8n/citas/crear
          Header: X-API-Key: 3c2b319de20b...
                           ↓
          Backend busca en DB: ¿Qué tenant tiene este API key?
                           ↓
          Encuentra: tenant_id = f0db1afa-6f46...
                           ↓
          Crea la cita SOLO para ese tenant
```

**Headers que debe enviar n8n:**
```http
X-API-Key: 3c2b319de20b9f5a95d6623b7e65efda21cd5f0f85a9a61a80b7437f1fe10d37
Content-Type: application/json
```

**Middleware en Backend:** `verifyApiKey`
- Lee el `X-API-Key` del header
- Busca: `SELECT tenant_id FROM negocios WHERE api_key = ?`
- Asigna `req.tenantId` para usar en controllers

## 📍 Endpoints Disponibles

### Para Frontend (requiere JWT)
```
GET    /api/citas/listar
POST   /api/citas/crear
GET    /api/citas/disponibilidad
PUT    /api/citas/actualizar/:id
DELETE /api/citas/cancelar/:id
```

### Para n8n (requiere API Key)
```
GET    /api/n8n/citas/listar
POST   /api/n8n/citas/crear
GET    /api/n8n/citas/disponibilidad
PUT    /api/n8n/citas/actualizar/:id
DELETE /api/n8n/citas/cancelar/:id
GET    /api/n8n/clientes/buscar
POST   /api/n8n/clientes/crear
GET    /api/n8n/servicios/listar
```

## 🔍 Ejemplo Completo de Flujo n8n

### 1. Usuario escribe en WhatsApp
```
Cliente: "Hola, quiero cita para manicura mañana a las 10am"
```

### 2. n8n procesa y llama a tu API

**Paso 1: Buscar el servicio "manicura"**
```http
GET http://localhost:5000/api/n8n/servicios/listar
Headers:
  X-API-Key: 3c2b319de20b9f5a95d6623b7e65efda21cd5f0f...
```

**Respuesta:**
```json
[
  {
    "servicio_id": 1,
    "nombre": "Manicura",
    "precio": 25,
    "duracion": 60
  }
]
```

**Paso 2: Consultar disponibilidad para mañana 10am**
```http
GET http://localhost:5000/api/n8n/citas/disponibilidad?fecha=2026-01-18&servicio_id=1
Headers:
  X-API-Key: 3c2b319de20b9f5a95d6623b7e65efda21cd5f0f...
```

**Respuesta:**
```json
{
  "fecha": "2026-01-18",
  "slots_disponibles": [
    { "hora_inicio": "09:00", "hora_fin": "10:00", "disponible": true },
    { "hora_inicio": "10:00", "hora_fin": "11:00", "disponible": true },
    { "hora_inicio": "11:00", "hora_fin": "12:00", "disponible": false }
  ]
}
```

**Paso 3: Buscar o crear cliente**
```http
GET http://localhost:5000/api/n8n/clientes/buscar?telefono=+34612345678
Headers:
  X-API-Key: 3c2b319de20b9f5a95d6623b7e65efda21cd5f0f...
```

**Si no existe, crear:**
```http
POST http://localhost:5000/api/n8n/clientes/crear
Headers:
  X-API-Key: 3c2b319de20b9f5a95d6623b7e65efda21cd5f0f...
  Content-Type: application/json
Body:
{
  "nombre": "María García",
  "telefono": "+34612345678",
  "email": "maria@example.com"
}
```

**Paso 4: Crear la cita**
```http
POST http://localhost:5000/api/n8n/citas/crear
Headers:
  X-API-Key: 3c2b319de20b9f5a95d6623b7e65efda21cd5f0f...
  Content-Type: application/json
Body:
{
  "cliente_id": 5,
  "servicio_id": 1,
  "fecha": "2026-01-18",
  "hora_inicio": "10:00",
  "notas": "Preferencia: esmalte rojo"
}
```

**Respuesta:**
```json
{
  "cita_id": 42,
  "cliente_nombre": "María García",
  "servicio_nombre": "Manicura",
  "fecha": "2026-01-18",
  "hora_inicio": "10:00",
  "hora_fin": "11:00",
  "estado": "confirmada",
  "precio": 25
}
```

### 3. n8n responde al cliente en WhatsApp
```
Bot: "✅ Perfecto María! Te apunto:
📅 18 de enero a las 10:00
💅 Manicura
💰 25€
📍 Calle Principal 123
¡Te esperamos! ✨"
```

## 🔒 Seguridad

### Aislamiento de Datos
```sql
-- TODAS las queries incluyen el tenant_id
SELECT * FROM citas WHERE tenant_id = ? AND fecha = ?
INSERT INTO citas (..., tenant_id) VALUES (..., ?)
UPDATE citas SET ... WHERE cita_id = ? AND tenant_id = ?
DELETE FROM citas WHERE cita_id = ? AND tenant_id = ?
```

### Protección de API Key
- **NUNCA** expongas el API Key en el frontend
- Solo úsalo en n8n (servidor a servidor)
- Si se compromete, puedes regenerarlo desde la base de datos

## 📊 Diagrama Completo

```
┌────────────────────────────────────────────────────────────────┐
│                        USUARIOS                                 │
└───────────┬────────────────────────────────────┬───────────────┘
            │                                    │
    ┌───────▼────────┐                  ┌────────▼─────────┐
    │   FRONTEND     │                  │   WHATSAPP       │
    │   React App    │                  │   Cliente        │
    └───────┬────────┘                  └────────┬─────────┘
            │                                    │
            │ JWT Token                          │
            │ + X-Tenant-Id                      │
            │                                    │
            │                           ┌────────▼─────────┐
            │                           │      n8n         │
            │                           │   Workflow       │
            │                           └────────┬─────────┘
            │                                    │
            │                                    │ X-API-Key
            │                                    │
    ┌───────▼────────────────────────────────────▼───────────┐
    │              BACKEND API                                │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │  Middleware: verifyTenant / verifyApiKey         │  │
    │  │  → Identifica tenant_id                          │  │
    │  └────────────────┬─────────────────────────────────┘  │
    │                   │                                     │
    │  ┌────────────────▼─────────────────────────────────┐  │
    │  │  Controllers (citasController, clientesController)│  │
    │  │  → Todas las queries filtran por tenant_id       │  │
    │  └────────────────┬─────────────────────────────────┘  │
    └───────────────────┼─────────────────────────────────────┘
                        │
    ┌───────────────────▼─────────────────────────────────┐
    │              BASE DE DATOS SQLite                    │
    │  ┌─────────────────────────────────────────────┐    │
    │  │  negocios                                    │    │
    │  │  ├─ tenant_id (UUID)                         │    │
    │  │  ├─ api_key (SECRET)                         │    │
    │  │  └─ email, nombre, config...                 │    │
    │  └─────────────────────────────────────────────┘    │
    │  ┌─────────────────────────────────────────────┐    │
    │  │  citas                                       │    │
    │  │  ├─ cita_id                                  │    │
    │  │  ├─ tenant_id ← FILTRO                       │    │
    │  │  └─ cliente_id, servicio_id, fecha...        │    │
    │  └─────────────────────────────────────────────┘    │
    └────────────────────────────────────────────────────┘
```

## ✅ Checklist para Configurar n8n

1. ✅ Backend corriendo en http://localhost:5000
2. ⏳ Obtener tu API Key desde el frontend (Configuración → n8n Integration)
3. ⏳ Configurar n8n:
   - Cada nodo HTTP Request debe incluir header: `X-API-Key: <tu_api_key>`
   - URL base: `http://localhost:5000/api/n8n/`
4. ⏳ Probar endpoints en n8n
5. ⏳ Implementar flujo completo de creación de citas

## 🚀 Próximos Pasos

Una vez tengas tu API Key:
1. Actualizar los nodos HTTP Request en tu flujo de n8n
2. Agregar el header X-API-Key en cada petición
3. Probar el flujo completo desde WhatsApp
4. Implementar webhooks para notificaciones
