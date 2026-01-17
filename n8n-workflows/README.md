# 🚀 Workflows de n8n para Sistema de Citas

## 📥 Cómo Importar el Workflow

### Opción 1: Desde la interfaz de n8n

1. Abre n8n en tu navegador
2. Haz clic en el menú (☰) en la esquina superior izquierda
3. Selecciona **"Workflows"**
4. Haz clic en **"Import from File"**
5. Selecciona el archivo `crear-cita-manual.json`
6. Haz clic en **"Import"**

### Opción 2: Copiar y Pegar

1. Abre el archivo `crear-cita-manual.json`
2. Copia TODO el contenido
3. En n8n, haz clic en el menú (☰) → **"Workflows"** → **"Import from URL or Clipboard"**
4. Pega el contenido y haz clic en **"Import"**

## 🧪 Workflow: Crear Cita Manual (PRUEBA)

### ¿Qué hace este workflow?

Este workflow te permite crear una cita de prueba de forma manual con un solo clic:

1. **Lista los servicios** disponibles en tu negocio
2. **Selecciona automáticamente** el primer servicio
3. **Consulta disponibilidad** para mañana a las 10:00
4. **Busca un cliente** por teléfono (+34612345678)
5. **Si no existe, lo crea** automáticamente
6. **Crea la cita** con todos los datos
7. **Muestra el resultado** formateado

### 📋 Flujo Completo

```
┌─────────────────┐
│ Inicio Manual   │  → Haces clic en "Execute Workflow"
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ 1️⃣ Listar Servicios     │  → GET /api/n8n/servicios/listar
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Preparar Datos          │  → Selecciona primer servicio
│ - servicio_id           │  → Fecha: mañana
│ - fecha: mañana         │  → Hora: 10:00
│ - hora: 10:00           │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 2️⃣ Consultar Disponibilidad  │  → GET /api/n8n/citas/disponibilidad
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 3️⃣ Buscar Cliente        │  → GET /api/n8n/clientes/buscar
│ Tel: +34612345678       │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────┐
│ ¿Cliente Existe?     │
└─────┬───────────┬────┘
      │           │
   SÍ │           │ NO
      │           │
      │           ▼
      │  ┌─────────────────────┐
      │  │ Crear Nuevo Cliente │  → POST /api/n8n/clientes/crear
      │  └─────────┬───────────┘
      │            │
      ▼            ▼
┌──────────────────────┐
│ Preparar Cliente     │  → Extrae cliente_id
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Combinar Datos       │  → Junta servicio + cliente + fecha
└────────┬─────────────┘
         │
         ▼
┌─────────────────────────┐
│ 4️⃣ Crear Cita           │  → POST /api/n8n/citas/crear
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Formatear Resultado     │  → Muestra resumen bonito
│ ✅ CITA CREADA          │
│ 📅 Fecha y hora         │
│ 💰 Precio               │
└─────────────────────────┘
```

### 🎯 Cómo Ejecutar

1. **Abre el workflow** en n8n
2. **Haz clic en "Execute Workflow"** (botón superior derecho)
3. **Espera unos segundos** mientras procesa
4. **Revisa el resultado** en el nodo "Formatear Resultado"

### 📝 Datos de Prueba

El workflow usa estos datos por defecto:

```javascript
Cliente de Prueba:
  - Nombre: "Cliente Prueba"
  - Teléfono: "+34612345678"
  - Email: "prueba@test.com"

Cita:
  - Servicio: Primer servicio disponible
  - Fecha: Mañana
  - Hora: 10:00
  - Duración: Según el servicio
```

### ✏️ Personalizar el Workflow

#### Cambiar el teléfono del cliente

En el nodo **"3️⃣ Buscar Cliente"**:
```
URL: http://localhost:5000/api/n8n/clientes/buscar?telefono=+34612345678
                                                              ↑
                                                   Cambia este número
```

En el nodo **"Crear Nuevo Cliente"**:
```json
{
  "nombre": "Cliente Prueba",  ← Cambia el nombre
  "telefono": "+34612345678",  ← Cambia el teléfono
  "email": "prueba@test.com"   ← Cambia el email
}
```

#### Cambiar fecha y hora

En el nodo **"Preparar Datos"**:
```javascript
// Para fecha (actualmente: mañana)
"fecha_cita": "={{ $now.plus(1, 'days').toFormat('yyyy-MM-dd') }}"

// Para cambiar a pasado mañana:
"fecha_cita": "={{ $now.plus(2, 'days').toFormat('yyyy-MM-dd') }}"

// Para una fecha específica:
"fecha_cita": "2026-01-20"

// Para hora (actualmente: 10:00)
"hora_inicio": "10:00"  ← Cambia a "14:30", "16:00", etc.
```

#### Cambiar el servicio

Actualmente toma el **primer servicio** (`$json[0]`).

Para tomar otro servicio, cambia en **"Preparar Datos"**:
```javascript
// Primer servicio
"servicio_id": "={{ $json[0].servicio_id }}"

// Segundo servicio
"servicio_id": "={{ $json[1].servicio_id }}"

// Tercer servicio
"servicio_id": "={{ $json[2].servicio_id }}"

// O un ID fijo
"servicio_id": 2
```

### 🔍 Verificar que Funcionó

1. **En n8n**: Revisa el nodo "Formatear Resultado" para ver los detalles de la cita
2. **En tu Frontend**: Ve a http://localhost:5173/appointments y verás la cita creada
3. **En la base de datos**: Se habrá creado el registro en la tabla `citas`

### ❌ Solución de Problemas

#### Error: "API Key inválida"
- Verifica que el header `X-API-Key` tenga el valor correcto
- Tu API Key es: `f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788`

#### Error: "Servicio no encontrado"
- Asegúrate de tener al menos un servicio creado en tu negocio
- Ve a http://localhost:5173/services y crea un servicio

#### Error: "No hay disponibilidad"
- Verifica que tengas horarios configurados
- Ve a Configuración → Schedule y configura tus horarios

#### Error: "Connection refused"
- Asegúrate de que el backend esté corriendo en http://localhost:5000
- Ejecuta: `cd backend && npm run dev`

### 🔗 URLs de los Endpoints

Todos los endpoints están en `http://localhost:5000/api/n8n/`

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/servicios/listar` | GET | Lista todos los servicios |
| `/citas/disponibilidad` | GET | Consulta disponibilidad |
| `/clientes/buscar` | GET | Busca cliente por teléfono |
| `/clientes/crear` | POST | Crea un nuevo cliente |
| `/citas/crear` | POST | Crea una nueva cita |
| `/citas/listar` | GET | Lista todas las citas |
| `/citas/cancelar/:id` | DELETE | Cancela una cita |

### 📊 Siguiente Paso: Integrar con WhatsApp

Una vez que este flujo funcione, puedes:
1. Crear un webhook en n8n que reciba mensajes de WhatsApp
2. Usar este mismo flujo pero en lugar de manual, activado por el webhook
3. Extraer datos del mensaje del cliente (nombre, servicio deseado, fecha)
4. Crear la cita automáticamente
5. Responder al cliente por WhatsApp

## 🎓 Recursos

- **Documentación API**: Ver `ARQUITECTURA-API.md` en la raíz del proyecto
- **Backend URL**: http://localhost:5000
- **Frontend URL**: http://localhost:5173
- **API Key**: `f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788`
- **Tenant ID**: `f0db1afa-6f46-461d-95a9-65aed91f66ca`
