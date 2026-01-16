# Backend API - Sistema de Gestión de Citas

Backend completo con Express + SQLite para el sistema de gestión de citas multi-tenant.

## 🚀 Características

- ✅ API REST completa
- ✅ Base de datos SQLite (fácil de usar, sin instalación)
- ✅ Autenticación con JWT
- ✅ Multi-tenant con aislamiento de datos
- ✅ Sistema de recordatorios automáticos (12h antes)
- ✅ Webhooks a n8n para recordatorios
- ✅ Endpoints para n8n (API Key)
- ✅ Endpoints para frontend (JWT Token)

## 📋 Requisitos

- Node.js 18+
- npm

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Edita `.env`:
```env
PORT=5000
JWT_SECRET=cambia_este_secreto_por_algo_seguro
N8N_WEBHOOK_URL=http://localhost:5678/webhook/recordatorio-cita
FRONTEND_URL=http://localhost:5173
REMINDER_HOURS_BEFORE=12
```

3. **Inicializar base de datos:**
```bash
npm run init-db
```

Esto creará `database/citas.db` con todas las tablas.

4. **Iniciar servidor:**
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará en: `http://localhost:5000`

## 📊 Base de Datos

SQLite con 4 tablas principales:

- **negocios**: Tenants (cada negocio)
- **servicios**: Servicios que ofrece cada negocio
- **clientes**: Base de datos de clientes por negocio
- **citas**: Todas las citas agendadas

## 🔐 Autenticación

### Frontend (JWT Token)

El frontend usa JWT tokens después de login con Google:

```javascript
headers: {
  'Authorization': 'Bearer <token>',
  'X-Tenant-Id': '<tenant_id>'
}
```

### n8n (API Key)

n8n usa API Key (más simple, sin login):

```javascript
headers: {
  'X-API-Key': '<api_key>'
}
```

El API Key se genera automáticamente al crear el negocio.

## 📡 Endpoints

### 🔓 Públicos

#### POST /api/auth/google
Login con Google OAuth
```json
{
  "credential": "<google_jwt_token>"
}
```

### 🔒 Frontend (requiere JWT)

#### Citas
- `POST /api/citas/crear` - Crear cita
- `GET /api/citas/listar` - Listar citas
- `GET /api/citas/disponibilidad` - Consultar horarios disponibles
- `GET /api/citas/:id` - Obtener una cita
- `PUT /api/citas/actualizar/:id` - Actualizar cita
- `DELETE /api/citas/cancelar/:id` - Cancelar cita

#### Servicios
- `GET /api/servicios/listar` - Listar servicios
- `POST /api/servicios/crear` - Crear servicio
- `PUT /api/servicios/actualizar/:id` - Actualizar servicio
- `DELETE /api/servicios/:id` - Eliminar servicio

#### Clientes
- `GET /api/clientes/listar` - Listar clientes
- `POST /api/clientes/crear` - Crear cliente
- `GET /api/clientes/buscar` - Buscar cliente
- `PUT /api/clientes/actualizar/:id` - Actualizar cliente

#### Configuración
- `GET /api/negocio/config` - Obtener configuración
- `PUT /api/negocio/config` - Actualizar configuración
- `PUT /api/negocio/horario` - Actualizar horario

### 🤖 n8n (requiere API Key)

#### POST /api/n8n/citas/crear
Crear cita desde el chatbot
```json
{
  "cliente_nombre": "Juan Pérez",
  "cliente_telefono": "612345678",
  "servicio_id": "uuid-del-servicio",
  "fecha": "2024-01-20",
  "hora": "10:00",
  "notas": "Cliente nuevo"
}
```

#### GET /api/n8n/citas/disponibilidad
Consultar horarios disponibles
```
GET /api/n8n/citas/disponibilidad?fecha=2024-01-20&servicio_id=uuid
```

Respuesta:
```json
{
  "fecha": "2024-01-20",
  "servicio_id": "uuid",
  "duracion": 60,
  "slots_disponibles": [
    { "hora": "09:00", "disponible": true },
    { "hora": "09:30", "disponible": true },
    { "hora": "10:00", "disponible": true }
  ]
}
```

#### GET /api/n8n/clientes/buscar
Buscar cliente por teléfono
```
GET /api/n8n/clientes/buscar?telefono=612345678
```

#### DELETE /api/n8n/citas/cancelar/:id
Cancelar cita
```json
{
  "motivo": "Cliente canceló por WhatsApp"
}
```

## 🔔 Sistema de Recordatorios

El backend revisa cada **30 minutos** si hay citas que necesitan recordatorio.

### Configuración

En `.env`:
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/recordatorio-cita
REMINDER_HOURS_BEFORE=12
```

### Flujo de Recordatorio

1. **Backend detecta** cita que es en 12 horas
2. **Backend envía POST** a n8n webhook con:
```json
{
  "tipo": "recordatorio_cita",
  "cita": {
    "cita_id": "uuid",
    "fecha": "2024-01-20",
    "hora": "14:00",
    "servicio": "Corte de cabello",
    "notas": "..."
  },
  "cliente": {
    "nombre": "Juan Pérez",
    "telefono": "612345678",
    "email": "juan@example.com"
  },
  "negocio": {
    "tenant_id": "uuid",
    "nombre": "Peluquería María",
    "telefono": "600111222",
    "direccion": "Calle Mayor 1"
  },
  "timestamp": "2024-01-20T02:00:00.000Z"
}
```

3. **n8n recibe** el webhook y envía WhatsApp al cliente
4. **Backend marca** `recordatorio_enviado = 1`

### Testing de Recordatorios

Enviar recordatorio manual:
```bash
curl -X POST http://localhost:5000/api/test/recordatorio/CITA_ID \
  -H "X-Tenant-Id: TENANT_ID"
```

## 🔗 Integración con n8n

### Paso 1: Obtener API Key

Después de login, el frontend muestra el API Key en Configuración → Integración n8n.

También puedes obtenerlo desde la base de datos:
```bash
sqlite3 database/citas.db "SELECT api_key FROM negocios WHERE email='tu@email.com'"
```

### Paso 2: Configurar n8n Workflow

Crear un workflow en n8n con:

#### Node 1: HTTP Request (Consultar disponibilidad)
```
URL: http://localhost:5000/api/n8n/citas/disponibilidad
Method: GET
Query Parameters:
  - fecha: {{$json.fecha}}
  - servicio_id: {{$json.servicio_id}}
Headers:
  - X-API-Key: <tu_api_key>
```

#### Node 2: HTTP Request (Crear cita)
```
URL: http://localhost:5000/api/n8n/citas/crear
Method: POST
Headers:
  - X-API-Key: <tu_api_key>
Body:
  {
    "cliente_nombre": "{{$json.nombre}}",
    "cliente_telefono": "{{$json.telefono}}",
    "servicio_id": "{{$json.servicio_id}}",
    "fecha": "{{$json.fecha}}",
    "hora": "{{$json.hora}}",
    "notas": "Cita creada por chatbot"
  }
```

#### Node 3: Webhook (Recibir recordatorios)
```
URL: http://localhost:5678/webhook/recordatorio-cita
Method: POST
```

Desde este webhook puedes:
- Extraer datos: `{{$json.cliente.telefono}}`
- Enviar WhatsApp con el recordatorio
- Guardar en Google Sheets, etc.

## 🧪 Testing

### Crear cita con cURL:

```bash
# Obtener API Key primero
curl http://localhost:5000/api/negocio/config \
  -H "X-Tenant-Id: TU_TENANT_ID"

# Crear cita
curl -X POST http://localhost:5000/api/n8n/citas/crear \
  -H "X-API-Key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "Juan Test",
    "cliente_telefono": "612345678",
    "servicio_id": "SERVICIO_UUID",
    "fecha": "2024-01-25",
    "hora": "10:00",
    "notas": "Test desde cURL"
  }'
```

### Consultar disponibilidad:

```bash
curl "http://localhost:5000/api/n8n/citas/disponibilidad?fecha=2024-01-25&servicio_id=UUID" \
  -H "X-API-Key: TU_API_KEY"
```

## 📝 Modelo de Datos

### Crear cita
```json
{
  "cliente_nombre": "string (requerido si no hay cliente_id)",
  "cliente_telefono": "string (requerido si no hay cliente_id)",
  "cliente_id": "uuid (opcional, si existe el cliente)",
  "servicio_id": "uuid (requerido)",
  "fecha": "YYYY-MM-DD (requerido)",
  "hora": "HH:MM (requerido)",
  "notas": "string (opcional)"
}
```

### Respuesta de cita
```json
{
  "cita_id": "uuid",
  "tenant_id": "uuid",
  "cliente_id": "uuid",
  "cliente_nombre": "string",
  "cliente_telefono": "string",
  "servicio_id": "uuid",
  "servicio_nombre": "string",
  "fecha": "YYYY-MM-DD",
  "hora_inicio": "HH:MM",
  "hora_fin": "HH:MM",
  "estado": "pendiente|confirmada|completada|cancelada|no_show",
  "notas": "string",
  "recordatorio_enviado": 0|1,
  "created_at": "timestamp",
  "created_by": "manual|chatbot|api"
}
```

## 🐛 Troubleshooting

### Error: "Token inválido"
- Verifica que el JWT_SECRET en `.env` coincida
- Revisa que el token no haya expirado (válido 7 días)

### Error: "API Key inválida"
- Verifica el API Key en la tabla `negocios`
- Asegúrate de enviar el header `X-API-Key`

### Recordatorios no se envían
- Verifica `N8N_WEBHOOK_URL` en `.env`
- Revisa los logs del servidor
- Verifica que n8n esté corriendo

## 📦 Estructura de Archivos

```
backend/
├── controllers/           # Lógica de negocio
│   ├── authController.js
│   ├── citasController.js
│   ├── clientesController.js
│   └── serviciosController.js
├── database/              # Base de datos
│   ├── init.js           # Script de inicialización
│   ├── db.js             # Conexión y helpers
│   └── citas.db          # SQLite database (auto-generado)
├── middleware/            # Middleware Express
│   └── auth.js           # Autenticación y autorización
├── utils/                 # Utilidades
│   └── reminders.js      # Sistema de recordatorios
├── server.js             # Servidor principal
├── package.json
├── .env.example
└── README.md
```

## 🚀 Deployment

Para producción:

1. Usar PostgreSQL en lugar de SQLite
2. Configurar HTTPS
3. Variables de entorno seguras
4. Configurar CORS apropiado
5. Rate limiting
6. Monitoreo y logs

## 📄 Licencia

MIT
