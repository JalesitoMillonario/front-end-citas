# 📚 Documentación de APIs - Sistema de Citas

## 🔑 Autenticación

Todas las APIs de n8n requieren el header `X-API-Key`:

```
X-API-Key: f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788
```

## 🌐 Base URL

```
http://34.57.154.181:5000
```

---

## 📋 SERVICIOS

### GET `/api/n8n/servicios/listar`

Lista todos los servicios disponibles del negocio.

**Headers:**
```
X-API-Key: {api-key}
```

**Response 200:**
```json
[
  {
    "servicio_id": "563e5cc9-ff3c-4e7e-ba35-4d797017e32a",
    "tenant_id": "f0db1afa-6f46-461d-95a9-65aed91f66ca",
    "nombre": "Manicura",
    "descripcion": "Manicura completa con esmaltado",
    "duracion_minutos": 60,
    "precio": "25.00",
    "categoria": "Uñas",
    "activo": 1
  },
  {
    "servicio_id": "c4b5be70-2357-402f-8a4b-ad922a52e2b3",
    "tenant_id": "f0db1afa-6f46-461d-95a9-65aed91f66ca",
    "nombre": "Pedicura",
    "descripcion": "Pedicura completa",
    "duracion_minutos": 60,
    "precio": "30.00",
    "categoria": "Uñas",
    "activo": 1
  }
]
```

**Uso en Chatbot:**
- El chatbot puede llamar a este endpoint para obtener los servicios actualizados
- Útil si agregas/modificas servicios sin tener que actualizar el prompt

---

## 📅 DISPONIBILIDAD

### GET `/api/n8n/citas/disponibilidad`

Consulta los horarios disponibles para un día específico.

**Headers:**
```
X-API-Key: {api-key}
```

**Query Params:**
- `fecha` (obligatorio): Fecha en formato `YYYY-MM-DD`

**Ejemplo:**
```
GET /api/n8n/citas/disponibilidad?fecha=2026-01-25
```

**Response 200:**
```json
{
  "fecha": "2026-01-25",
  "horario_apertura": "09:00",
  "horario_cierre": "20:00",
  "intervalo_minutos": 30,
  "slots": [
    {
      "hora": "09:00",
      "disponible": true
    },
    {
      "hora": "09:30",
      "disponible": true
    },
    {
      "hora": "10:00",
      "disponible": false,
      "ocupado_por": "Manicura",
      "cliente": "María García",
      "estado": "confirmada"
    },
    {
      "hora": "10:30",
      "disponible": false,
      "ocupado_por": "Manicura",
      "cliente": "María García",
      "estado": "confirmada"
    },
    {
      "hora": "11:00",
      "disponible": true
    }
  ]
}
```

**Errores:**
- `400`: Falta el parámetro `fecha`

---

## ✅ CREAR CITA

### POST `/api/n8n/citas/crear`

Crea una nueva cita. **Auto-crea el cliente** si no existe (por teléfono).

**Headers:**
```
X-API-Key: {api-key}
Content-Type: application/json
```

**Body:**
```json
{
  "cliente_nombre": "María García",
  "cliente_telefono": "+34612345678",
  "cliente_email": "maria@email.com",
  "servicio_id": "563e5cc9-ff3c-4e7e-ba35-4d797017e32a",
  "fecha": "2026-01-25",
  "hora": "10:00"
}
```

**Campos:**
- `cliente_nombre` (obligatorio): Nombre completo del cliente
- `cliente_telefono` (obligatorio): Teléfono con formato internacional
- `cliente_email` (opcional): Email del cliente
- `servicio_id` (obligatorio): UUID del servicio
- `fecha` (obligatorio): Fecha en formato `YYYY-MM-DD`
- `hora` (obligatorio): Hora en formato `HH:mm` (24h)

**Response 201:**
```json
{
  "message": "Cita creada exitosamente",
  "cita": {
    "cita_id": "abc123...",
    "cliente_id": "xyz789...",
    "servicio_id": "563e5cc9-ff3c-4e7e-ba35-4d797017e32a",
    "fecha": "2026-01-25",
    "hora_inicio": "10:00",
    "hora_fin": "11:00",
    "estado": "confirmada",
    "cliente_nombre": "María García",
    "servicio_nombre": "Manicura",
    "precio_servicio": "25.00"
  }
}
```

**Comportamiento Auto-Upsert:**
1. Busca cliente por `cliente_telefono`
2. Si existe → usa ese `cliente_id`
3. Si NO existe → crea cliente nuevo automáticamente
4. Crea la cita con el `cliente_id` correspondiente

**Validaciones:**
- ✅ Auto-calcula `hora_fin` según duración del servicio
- ✅ Verifica que el horario no esté ocupado
- ✅ Verifica que el servicio exista y esté activo

**Errores:**
- `400`: Faltan datos obligatorios
- `404`: Servicio no encontrado
- `409`: Horario ya ocupado

---

## 🔄 MODIFICAR CITA

### PUT `/api/n8n/citas/modificar-por-telefono`

Modifica una cita existente (fecha, hora, servicio) **sin necesitar cita_id**.

**Headers:**
```
X-API-Key: {api-key}
Content-Type: application/json
```

**Body:**
```json
{
  "telefono": "+34612345678",
  "fecha_actual": "2026-01-25",
  "hora_actual": "10:00",
  "nueva_fecha": "2026-01-27",
  "nueva_hora": "14:00",
  "nuevo_servicio_id": null
}
```

**Campos:**
- `telefono` (obligatorio): Teléfono del cliente
- `fecha_actual` (obligatorio): Fecha actual de la cita
- `hora_actual` (opcional): Hora actual, solo si hay múltiples citas ese día
- `nueva_fecha` (obligatorio): Nueva fecha deseada
- `nueva_hora` (obligatorio): Nueva hora deseada
- `nuevo_servicio_id` (opcional): Si quiere cambiar el servicio también

**Response 200:**
```json
{
  "success": true,
  "message": "Cita modificada exitosamente",
  "cita_anterior": {
    "fecha": "2026-01-25",
    "hora": "10:00",
    "servicio": "Manicura"
  },
  "cita_nueva": {
    "cliente": "María García",
    "servicio": "Manicura",
    "fecha": "2026-01-27",
    "hora": "14:00",
    "precio": "25"
  }
}
```

**Validaciones:**
- ✅ Busca cita por `telefono` + `fecha_actual` (+ `hora_actual` si se especifica)
- ✅ Verifica que el nuevo horario esté disponible
- ✅ **Excluye la cita actual** de la verificación de conflictos
- ✅ Auto-calcula `hora_fin` según duración del servicio

**Errores:**
- `400`: Faltan parámetros obligatorios
- `404`: No se encontró cita con ese teléfono/fecha
- `409`: El nuevo horario no está disponible

---

## ❌ CANCELAR CITA

### POST `/api/n8n/citas/cancelar-por-telefono`

Cancela una cita existente **sin necesitar cita_id**.

**Headers:**
```
X-API-Key: {api-key}
Content-Type: application/json
```

**Body:**
```json
{
  "telefono": "+34612345678",
  "fecha": "2026-01-25",
  "hora": "10:00",
  "motivo": "Cliente canceló por cambio de planes"
}
```

**Campos:**
- `telefono` (obligatorio): Teléfono del cliente
- `fecha` (obligatorio): Fecha de la cita
- `hora` (opcional): Hora, solo si hay múltiples citas ese día
- `motivo` (opcional): Razón de la cancelación

**Response 200:**
```json
{
  "success": true,
  "message": "Cita cancelada exitosamente",
  "cita_cancelada": {
    "cliente": "María García",
    "servicio": "Manicura",
    "fecha": "2026-01-25",
    "hora": "10:00"
  }
}
```

**Comportamiento:**
- Marca la cita con estado `cancelada`
- Se auto-borra después de 1 hora (limpieza automática)
- Envía webhook de notificación (si está configurado)

**Errores:**
- `400`: Faltan parámetros obligatorios
- `404`: No se encontró cita para ese teléfono/fecha

---

## 📋 LISTAR CITAS

### GET `/api/n8n/citas/listar`

Lista citas con filtros opcionales.

**Headers:**
```
X-API-Key: {api-key}
```

**Query Params (todos opcionales):**
- `fecha`: Filtrar por fecha específica (`YYYY-MM-DD`)
- `fecha_inicio`: Rango desde (`YYYY-MM-DD`)
- `fecha_fin`: Rango hasta (`YYYY-MM-DD`)
- `estado`: Filtrar por estado (`confirmada`, `cancelada`, `completada`)

**Ejemplos:**
```
GET /api/n8n/citas/listar
GET /api/n8n/citas/listar?fecha=2026-01-25
GET /api/n8n/citas/listar?estado=confirmada
GET /api/n8n/citas/listar?fecha_inicio=2026-01-20&fecha_fin=2026-01-31
```

**Response 200:**
```json
[
  {
    "cita_id": "abc123...",
    "cliente_nombre": "María García",
    "cliente_telefono": "+34612345678",
    "servicio_nombre": "Manicura",
    "fecha": "2026-01-25",
    "hora_inicio": "10:00",
    "hora_fin": "11:00",
    "estado": "confirmada",
    "precio": "25.00"
  }
]
```

---

## 👤 CLIENTES

### GET `/api/n8n/clientes/buscar`

Busca un cliente por teléfono.

**Headers:**
```
X-API-Key: {api-key}
```

**Query Params:**
- `telefono` (obligatorio): Teléfono del cliente

**Ejemplo:**
```
GET /api/n8n/clientes/buscar?telefono=+34612345678
```

**Response 200:**
```json
{
  "cliente_id": "xyz789...",
  "nombre": "María García",
  "telefono": "+34612345678",
  "email": "maria@email.com"
}
```

**Response 404:**
```json
{
  "error": "Cliente no encontrado"
}
```

### POST `/api/n8n/clientes/crear`

Crea un nuevo cliente manualmente.

**Headers:**
```
X-API-Key: {api-key}
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Ana López",
  "telefono": "+34611222333",
  "email": "ana@email.com"
}
```

**Response 201:**
```json
{
  "cliente_id": "...",
  "nombre": "Ana López",
  "telefono": "+34611222333",
  "email": "ana@email.com"
}
```

---

## 🔄 FLUJOS RECOMENDADOS

### Flujo 1: Agendar Cita (Chatbot)

```
1. GET /api/n8n/servicios/listar
   → Usuario elige servicio

2. GET /api/n8n/citas/disponibilidad?fecha=2026-01-25
   → Mostrar horarios disponibles
   → Usuario elige horario

3. POST /api/n8n/citas/crear
   → Crear cita (auto-crea cliente si no existe)
```

### Flujo 2: Modificar Cita (Chatbot)

```
1. Usuario dice: "Quiero cambiar mi cita del viernes"

2. Pedir: teléfono, fecha_actual, hora_actual (si hay varias)

3. GET /api/n8n/citas/disponibilidad?fecha=2026-01-27
   → Mostrar horarios disponibles para nueva fecha
   → Usuario elige nuevo horario

4. PUT /api/n8n/citas/modificar-por-telefono
   → Modificar cita
```

### Flujo 3: Cancelar Cita (Chatbot)

```
1. Usuario dice: "Necesito cancelar mi cita"

2. Pedir: teléfono, fecha (y hora si tiene varias ese día)

3. POST /api/n8n/citas/cancelar-por-telefono
   → Cancelar cita
```

---

## 🚨 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | ✅ Success |
| 201 | ✅ Created |
| 400 | ❌ Bad Request - Faltan parámetros |
| 401 | ❌ Unauthorized - API Key inválida |
| 404 | ❌ Not Found - Recurso no encontrado |
| 409 | ❌ Conflict - Horario ocupado |
| 500 | ❌ Server Error - Error interno |

---

## 📝 Notas Importantes

1. **Auto-Upsert de Clientes**: El endpoint `/crear` busca por teléfono y reutiliza el cliente si existe.

2. **Auto-Limpieza**: Las citas canceladas se borran automáticamente después de 1 hora.

3. **Validación de Horarios**: Todos los endpoints que crean/modifican citas verifican disponibilidad.

4. **Formato de Fechas**: Siempre usar `YYYY-MM-DD` (ISO 8601).

5. **Formato de Horas**: Siempre usar `HH:mm` en formato 24 horas.

6. **Teléfonos**: Usar formato internacional (ej: `+34612345678`).

7. **IDs de Servicios**: Son UUIDs fijos, consultar con `/servicios/listar`.

---

## 🧪 Testing

Usa el archivo `test-api.http` con **REST Client** (VS Code) o **Thunder Client** para probar todos los endpoints.

**Instalación REST Client:**
```bash
code --install-extension humao.rest-client
```

Luego abre `backend/test-api.http` y haz click en "Send Request" sobre cada endpoint.
