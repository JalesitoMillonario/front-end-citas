# 🚀 Sistema de Citas Completo - n8n Workflow

Este es un workflow TODO-EN-UNO que incluye todas las operaciones del sistema de citas.

## 📋 Funcionalidades

1. **📅 Consultar Disponibilidad** - Ver horarios libres de un día
2. **➕ Crear Cita** - Crear nueva cita (auto-crea cliente si no existe)
3. **📋 Listar Citas** - Ver todas las citas del sistema
4. **❌ Cancelar Cita** - Cancelar una cita existente

## 🎯 Cómo Usar

### 1. Importar el Workflow

```bash
# En n8n: http://34.57.154.181:5678
# Click: "+" → "Import from File"
# Selecciona: sistema-citas-completo.json
```

### 2. Configurar la Acción

En el nodo **"⚙️ Configurar Datos"**, cambia el valor de `accion`:

- `"disponibilidad"` - Para consultar horarios libres
- `"crear"` - Para crear una cita nueva
- `"listar"` - Para listar todas las citas
- `"cancelar"` - Para cancelar una cita

### 3. Configurar los Datos

Según la acción que elijas, configura los parámetros necesarios:

#### Para DISPONIBILIDAD:
```json
{
  "accion": "disponibilidad",
  "fecha": "2026-01-20"
}
```

#### Para CREAR CITA:
```json
{
  "accion": "crear",
  "cliente_nombre": "María García",
  "cliente_telefono": "+34612345678",
  "cliente_email": "maria@email.com",
  "servicio_id": "563e5cc9-ff3c-4e7e-ba35-4d797017e32a",
  "fecha": "2026-01-20",
  "hora": "10:00"
}
```

#### Para LISTAR:
```json
{
  "accion": "listar"
}
```

#### Para CANCELAR:
```json
{
  "accion": "cancelar",
  "cita_id": "f62401ea-ef75-499c-bf7c-77291cf618e6",
  "motivo_cancelacion": "Cliente canceló por teléfono"
}
```

## 🔑 Servicios Disponibles

Estos son los UUIDs de los servicios que puedes usar:

| Servicio | UUID | Precio | Duración |
|----------|------|--------|----------|
| Manicura | `563e5cc9-ff3c-4e7e-ba35-4d797017e32a` | 25€ | 60 min |
| Pedicura | `c4b5be70-2357-402f-8a4b-ad922a52e2b3` | 30€ | 60 min |
| Depilación Cejas | `5abb7e4e-61d3-4581-b297-0700d371bb26` | 10€ | 20 min |
| Masaje Facial | `bfcaa47b-6efe-48c2-939c-536d9ed6494f` | 40€ | 45 min |
| Limpieza Facial | `524f8e5c-eb10-4d1d-8dff-9f4c8b0fdeb3` | 50€ | 90 min |
| Depilación Piernas | `431a0e20-551e-4916-9991-da86ba5dfc6a` | 35€ | 45 min |
| Uñas de Gel | `d044cbcb-cc62-4729-addb-8e62e51e45b6` | 40€ | 90 min |
| Masaje Relajante | `7d0313e9-66e0-40a9-a3aa-ffe0d1216c12` | 60€ | 60 min |

## 📊 Estructura del Workflow

```
Inicio Manual
    ↓
⚙️ Configurar Datos (configura accion y parámetros)
    ↓
🔀 Elegir Acción (switch según valor de "accion")
    ├─→ 📅 Consultar Disponibilidad → ✨ Formatear
    ├─→ ➕ Crear Cita → ✨ Formatear
    ├─→ 📋 Listar Citas → ✨ Formatear
    └─→ ❌ Cancelar Cita → ✨ Formatear
```

## ✅ Ejemplos de Salida

### Disponibilidad
```json
{
  "accion": "disponibilidad",
  "fecha": "2026-01-20",
  "resumen": {
    "total_slots": 22,
    "libres": 20,
    "ocupados": 2
  },
  "horarios_libres": ["09:00", "09:30", "11:00", ...],
  "horarios_ocupados": [
    {
      "hora": "10:00",
      "cliente": "María García",
      "servicio": "Manicura"
    }
  ],
  "mensaje": "📅 Disponibilidad para 2026-01-20:\n✅ 20 slots libres\n❌ 2 slots ocupados"
}
```

### Crear Cita
```json
{
  "accion": "crear",
  "success": true,
  "cita_id": "f62401ea-ef75-499c-bf7c-77291cf618e6",
  "detalles": {
    "cliente": "María García",
    "telefono": "+34612345678",
    "servicio": "Manicura",
    "fecha": "2026-01-20",
    "hora": "10:00 - 11:00",
    "precio": "25€",
    "duracion": "60 min",
    "estado": "pendiente"
  },
  "mensaje": "✅ CITA CREADA\n👤 María García\n💆‍♀️ Manicura\n📅 2026-01-20 a las 10:00\n💰 25€"
}
```

### Listar Citas
```json
{
  "accion": "listar",
  "total": 5,
  "por_estado": {
    "pendiente": 3,
    "confirmada": 1,
    "completada": 0,
    "cancelada": 1
  },
  "citas": [
    {
      "id": "...",
      "cliente": "María García",
      "servicio": "Manicura",
      "fecha": "2026-01-20",
      "hora": "10:00 - 11:00",
      "estado": "pendiente",
      "precio": "25€"
    }
  ],
  "mensaje": "📋 LISTADO DE CITAS\nTotal: 5\n⏳ Pendientes: 3\n✅ Confirmadas: 1\n✔️ Completadas: 0\n❌ Canceladas: 1"
}
```

### Cancelar Cita
```json
{
  "accion": "cancelar",
  "success": true,
  "mensaje": "❌ CITA CANCELADA\nCita cancelada exitosamente"
}
```

## 🔧 Personalización

### Cambiar API Key
Edita todos los nodos HTTP Request y cambia el valor del header `X-API-Key`.

### Cambiar URLs
Si cambias el servidor, actualiza la URL base en cada nodo HTTP Request:
- Disponibilidad: `http://TU-IP:5000/api/n8n/citas/disponibilidad`
- Crear: `http://TU-IP:5000/api/n8n/citas/crear`
- Listar: `http://TU-IP:5000/api/n8n/citas/listar`
- Cancelar: `http://TU-IP:5000/api/n8n/citas/cancelar/`

### Añadir Validaciones
Puedes añadir nodos "IF" después de cada llamada HTTP para validar errores y manejarlos.

### Integrar con WhatsApp/Telegram
Después de los nodos de formateo, añade nodos de WhatsApp/Telegram para enviar notificaciones.

## 💡 Tips

1. **Para desarrollo**: Usa el nodo "Sticky Note" para añadir comentarios
2. **Para producción**: Activa el workflow para que se ejecute automáticamente
3. **Para debugging**: Activa "Save Execution Data" en settings
4. **Para testing**: Usa fechas futuras para evitar conflictos

## 🐛 Troubleshooting

### Error: "API Key no proporcionada"
- Verifica que el header `X-API-Key` esté configurado en todos los nodos HTTP

### Error: "Servicio no encontrado"
- Verifica que el `servicio_id` sea un UUID válido de la tabla servicios
- Ejecuta el seed script si no tienes servicios: `node backend/scripts/seed-servicios.js`

### Error: "Ya existe una cita en este horario"
- Consulta la disponibilidad primero
- Elige una hora que esté libre

### No aparece nada al ejecutar
- Verifica que el nodo "Elegir Acción" esté configurado correctamente
- Revisa el valor de `accion` en "Configurar Datos"

## 📞 Soporte

Para problemas o consultas:
- Backend: Revisa logs con `pm2 logs api-citas`
- Frontend: Revisa console del navegador
- n8n: Revisa executions en n8n UI
