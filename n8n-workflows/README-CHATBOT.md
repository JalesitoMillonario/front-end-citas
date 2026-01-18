# 🤖 Chatbot de Citas WhatsApp - Completo

Este es tu chatbot de WhatsApp adaptado para el sistema de citas de Beauty Center, manteniendo TODA la funcionalidad de memoria, procesamiento de audio/imágenes y Pinecone RAG.

## ✨ Características

### Funcionalidades Mantenidas (de tu chatbot original)
- ✅ **Redis para Memoria Persistente** - Conversación anterior guardada por usuario
- ✅ **Pinecone Vector Store** - RAG para información del negocio
- ✅ **Procesamiento de Audio** - Gemini 2.5 Flash transcribe audios
- ✅ **Procesamiento de Imágenes** - GPT-4O analiza fotos
- ✅ **Evolution API** - Integración con WhatsApp
- ✅ **Sistema de Loops** - Procesa múltiples mensajes/medios
- ✅ **Gestión de Timestamps** - Evita duplicados

### Nuevas Funcionalidades (adaptadas para citas)
- 🆕 **Consultar Disponibilidad** - Verifica horarios libres antes de agendar
- 🆕 **Crear Citas** - Solo después de verificar disponibilidad
- 🆕 **Cancelar Citas** - Por teléfono y fecha, sin necesitar cita_id
- 🆕 **Consultar Servicios** - Info de los 8 servicios disponibles
- 🆕 **Prompt Personalizado** - Asistente de estética con los servicios reales

## 🎯 Flujo del Chatbot

```
Cliente escribe por WhatsApp
    ↓
Webhook recibe mensaje → Redis guarda mensaje
    ↓
Switch (¿Es mensaje duplicado?)
    ↓
Split Out → Edit Fields → If1 (¿Hay conversación anterior?)
    ↓
Switch1 (¿Es audio/texto/imagen?)
    ├─→ Audio: Get media → Convert → Gemini transcribe
    ├─→ Texto: Pasa directo
    └─→ Imagen: Get media → Convert → GPT-4O analiza
    ↓
Merge → Sort → Aggregate (combina todo)
    ↓
Question & Answer Chain (GPT-4o-mini + Pinecone RAG)
    ↓
Code JS1 (parsea JSON response)
    ↓
Merge3 → Code JS2 (combina datos)
    ↓
Switch2 (según acción):
    ├─→ solicitud_cita → Guarda conversación
    ├─→ datos_cita_completos → HTTP Crear Cita → Guarda
    ├─→ cancelar_cita → HTTP Cancelar → Limpia conversación
    ├─→ consulta_disponibilidad → HTTP Disponibilidad → Guarda
    ├─→ consulta_resuelta → Limpia conversación
    └─→ consulta_servicios → Limpia conversación
    ↓
Send text (Evolution API) → Responde al cliente
    ↓
Redis3 (guarda conversación actualizada)
```

## 📋 Servicios Disponibles

El chatbot conoce estos 8 servicios:

| Servicio | Precio | Duración | ID |
|----------|--------|----------|-----|
| 💅 Manicura | 25€ | 60 min | 563e5cc9-ff3c-4e7e-ba35-4d797017e32a |
| 💅 Pedicura | 30€ | 60 min | c4b5be70-2357-402f-8a4b-ad922a52e2b3 |
| ✨ Depilación Cejas | 10€ | 20 min | 5abb7e4e-61d3-4581-b297-0700d371bb26 |
| 💆‍♀️ Masaje Facial | 40€ | 45 min | bfcaa47b-6efe-48c2-939c-536d9ed6494f |
| ✨ Limpieza Facial | 50€ | 90 min | 524f8e5c-eb10-4d1d-8dff-9f4c8b0fdeb3 |
| ✨ Depilación Piernas | 35€ | 45 min | 431a0e20-551e-4916-9991-da86ba5dfc6a |
| 💅 Uñas de Gel | 40€ | 90 min | d044cbcb-cc62-4729-addb-8e62e51e45b6 |
| 💆‍♀️ Masaje Relajante | 60€ | 60 min | 7d0313e9-66e0-40a9-a3aa-ffe0d1216c12 |

## 🚀 Instalación

### 1. Importar en n8n

```bash
# Accede a n8n: http://34.57.154.181:5678
# Click en "+" → "Import from File"
# Selecciona: n8n-workflows/chatbot-citas-whatsapp-completo.json
```

### 2. Configurar Credenciales

Debes tener configuradas estas credenciales en n8n:

- **OpenAI API** (para GPT-4o-mini y GPT-4O análisis imágenes)
  - ID: `VnDDmVjIH0VsSkeT`
  - Nombre: `OpenAi account`

- **Pinecone API** (para vector store)
  - ID: `7UymQg3pzFqCdVRk`
  - Nombre: `PineconeApi account`
  - Index: `prueba`

- **Redis** (para memoria)
  - ID: `uwcn4iSajnlROxZs`
  - Nombre: `Redis account`

- **Evolution API** (para WhatsApp)
  - ID: `qhY1MktXuLe8781r`
  - Nombre: `jaled`
  - Instance: `Pruebas`

- **Google Gemini API** (para transcribir audios)
  - ID: `Ynm6EOidl74pVSsS`
  - Nombre: `Google Gemini(PaLM) Api account 2`

### 3. Verificar URLs de API

Revisa que estos nodos tengan las URLs correctas:

- **HTTP Request Crear Cita**: `http://34.57.154.181:5000/api/n8n/citas/crear`
- **HTTP Request Disponibilidad**: `http://34.57.154.181:5000/api/n8n/citas/disponibilidad`
- **HTTP Request Cancelar**: `http://34.57.154.181:5000/api/n8n/citas/cancelar-por-telefono`

Todos con header:
```
X-API-Key: f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788
```

### 4. Activar el Workflow

1. Click en el botón "Active" en la esquina superior derecha
2. El webhook estará disponible en:
   ```
   http://34.57.154.181:5678/webhook/chatbot-citas
   ```

## 💬 Ejemplos de Conversación

### Ejemplo 1: Agendar Cita (con verificación de disponibilidad)

```
Cliente: Hola, quiero una cita para manicura mañana

Bot: ¡Hola! 👋 Claro, déjame ver qué horarios tenemos disponibles para mañana...
     [El bot llama a consulta_disponibilidad]

     ✅ Horarios disponibles para mañana:
     - 09:00
     - 09:30
     - 10:00
     - 11:00
     - 14:00
     - 15:00

     ¿Cuál te viene mejor? 😊

Cliente: El de las 10

Bot: Perfecto! 💅 Para confirmar tu cita de manicura mañana a las 10:00 necesito:
     - Tu nombre completo
     - Número de teléfono

Cliente: Soy María García, +34612345678

Bot: [El bot llama a crear_cita]

     ✅ CITA CONFIRMADA

     👤 María García
     💅 Manicura (25€)
     📅 2026-01-19
     🕐 10:00

     ¡Te esperamos! ✨
```

### Ejemplo 2: Cliente envía AUDIO

```
Cliente: [AUDIO: "Hola, necesito cancelar mi cita del viernes"]

Bot: [Gemini transcribe el audio]
     [GPT-4o-mini procesa: "Hola, necesito cancelar mi cita del viernes"]

     Claro, te ayudo a cancelar 👍
     ¿Me das tu teléfono y a qué hora era la cita?

Cliente: +34612345678, era a las 11

Bot: [El bot llama a cancelar_cita]

     ❌ CITA CANCELADA

     Cita cancelada exitosamente:
     👤 María García
     💅 Manicura
     📅 2026-01-24
     🕐 11:00
```

### Ejemplo 3: Cliente envía FOTO de uñas

```
Cliente: [FOTO de uñas decoradas]
         "Me gustaría algo así"

Bot: [GPT-4O analiza la imagen]
     [Descripción: "Uñas largas con diseño francés y brillantes"]

     ¡Qué bonitas! 😍 Esas uñas las hacemos con nuestro servicio de Uñas de Gel

     💅 Uñas de Gel - 40€
     ⏱ 90 minutos

     ¿Te gustaría agendar una cita? 📅

Cliente: Sí, para el sábado

Bot: [Consulta disponibilidad y sigue el flujo normal...]
```

## 🔧 Acciones del JSON Response

El bot responde siempre en formato JSON con estas acciones:

### 1. `consulta_servicios`
Cuando el cliente pregunta por servicios, precios, horarios generales.

**Ejemplo JSON:**
```json
{
  "action": "consulta_servicios",
  "respuesta_al_usuario": "Tenemos 8 servicios disponibles:\n💅 Manicura - 25€...",
  "cita_data": {
    "cliente_nombre": null,
    "cliente_telefono": null,
    "cliente_email": null,
    "servicio_id": null,
    "fecha": null,
    "hora": null
  },
  "disponibilidad_consultada": false,
  "next_field_to_ask_for": null
}
```

**Flujo:** Switch2 → Redis10 → Wait2 → Code JS7 → Wait3 → Redis11
**Resultado:** Limpia conversación después de 1 día

### 2. `consulta_disponibilidad`
Cuando el cliente pide ver horarios disponibles para un día específico.

**Ejemplo JSON:**
```json
{
  "action": "consulta_disponibilidad",
  "respuesta_al_usuario": "Déjame ver los horarios disponibles para mañana...",
  "cita_data": {
    "cliente_nombre": null,
    "cliente_telefono": null,
    "cliente_email": null,
    "servicio_id": null,
    "fecha": "2026-01-19",
    "hora": null
  },
  "disponibilidad_consultada": false,
  "next_field_to_ask_for": "hora"
}
```

**Flujo:** Switch2 → HTTP Request Disponibilidad → Code JS4 → Redis7
**Resultado:** Llama a `/api/n8n/citas/disponibilidad?fecha=2026-01-19`, guarda conversación

### 3. `solicitud_cita`
Cuando el cliente pide agendar pero aún faltan datos.

**Ejemplo JSON:**
```json
{
  "action": "solicitud_cita",
  "respuesta_al_usuario": "Perfecto! Para confirmar necesito tu nombre y teléfono",
  "cita_data": {
    "cliente_nombre": null,
    "cliente_telefono": null,
    "cliente_email": null,
    "servicio_id": "563e5cc9-ff3c-4e7e-ba35-4d797017e32a",
    "fecha": "2026-01-19",
    "hora": "10:00"
  },
  "disponibilidad_consultada": true,
  "next_field_to_ask_for": "cliente_nombre"
}
```

**Flujo:** Switch2 → Code JS3 → Send text → Redis3
**Resultado:** Solo guarda conversación y responde, NO crea cita aún

### 4. `datos_cita_completos`
Cuando tiene TODOS los datos Y ya consultó disponibilidad → CREA LA CITA.

**Ejemplo JSON:**
```json
{
  "action": "datos_cita_completos",
  "respuesta_al_usuario": "✅ CITA CONFIRMADA\n👤 María García\n💅 Manicura...",
  "cita_data": {
    "cliente_nombre": "María García",
    "cliente_telefono": "+34612345678",
    "cliente_email": "maria@email.com",
    "servicio_id": "563e5cc9-ff3c-4e7e-ba35-4d797017e32a",
    "fecha": "2026-01-19",
    "hora": "10:00"
  },
  "disponibilidad_consultada": true,
  "next_field_to_ask_for": null
}
```

**Flujo:** Switch2 → HTTP Request Crear Cita → Code JS6 → Redis9 → Wait1 → Redis6
**Resultado:** Crea la cita, guarda conversación, limpia después de 1 día

### 5. `cancelar_cita`
Cuando el cliente quiere cancelar una cita existente.

**Ejemplo JSON:**
```json
{
  "action": "cancelar_cita",
  "respuesta_al_usuario": "Claro, te ayudo a cancelar",
  "cita_data": {
    "cliente_nombre": null,
    "cliente_telefono": "+34612345678",
    "cliente_email": null,
    "servicio_id": null,
    "fecha": "2026-01-24",
    "hora": "11:00"
  },
  "disponibilidad_consultada": false,
  "next_field_to_ask_for": null
}
```

**Flujo:** Switch2 → HTTP Request Cancelar → Redis8
**Resultado:** Cancela la cita, limpia conversación inmediatamente

### 6. `consulta_resuelta`
Cuando el cliente solo preguntó algo general y ya se respondió.

**Ejemplo JSON:**
```json
{
  "action": "consulta_resuelta",
  "respuesta_al_usuario": "Estamos en Calle Principal 123, abiertos Lun-Vie 10-20h",
  "cita_data": {
    "cliente_nombre": null,
    "cliente_telefono": null,
    "cliente_email": null,
    "servicio_id": null,
    "fecha": null,
    "hora": null
  },
  "disponibilidad_consultada": false,
  "next_field_to_ask_for": null
}
```

**Flujo:** Switch2 → Redis5
**Resultado:** Limpia conversación inmediatamente

## 🔑 APIs Integradas

### 1. Consultar Disponibilidad
```http
GET http://34.57.154.181:5000/api/n8n/citas/disponibilidad?fecha=2026-01-19
X-API-Key: f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788
```

**Response:**
```json
{
  "fecha": "2026-01-19",
  "slots": [
    {"hora": "09:00", "disponible": true},
    {"hora": "09:30", "disponible": true},
    {"hora": "10:00", "disponible": false, "ocupado_por": "Manicura", "cliente": "Ana López"}
  ]
}
```

### 2. Crear Cita
```http
POST http://34.57.154.181:5000/api/n8n/citas/crear
X-API-Key: f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788
Content-Type: application/json

{
  "cliente_nombre": "María García",
  "cliente_telefono": "+34612345678",
  "cliente_email": "maria@email.com",
  "servicio_id": "563e5cc9-ff3c-4e7e-ba35-4d797017e32a",
  "fecha": "2026-01-19",
  "hora": "10:00"
}
```

**Response:**
```json
{
  "message": "Cita creada exitosamente",
  "cita": {
    "cita_id": "...",
    "cliente_nombre": "María García",
    "servicio_nombre": "Manicura",
    "fecha": "2026-01-19",
    "hora_inicio": "10:00",
    "estado": "confirmada"
  }
}
```

### 3. Cancelar Cita
```http
POST http://34.57.154.181:5000/api/n8n/citas/cancelar-por-telefono
X-API-Key: f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788
Content-Type: application/json

{
  "telefono": "+34612345678",
  "fecha": "2026-01-19",
  "hora": "10:00",
  "motivo": "Cancelación vía WhatsApp"
}
```

**Response:**
```json
{
  "message": "Cita cancelada exitosamente",
  "cita": {
    "cita_id": "...",
    "cliente_nombre": "María García",
    "servicio_nombre": "Manicura",
    "fecha": "2026-01-19",
    "hora_inicio": "10:00",
    "estado": "cancelada"
  }
}
```

## 🗄️ Memoria y Persistencia

### Redis - Conversación Anterior

El chatbot guarda el historial de conversación en Redis usando:

- **Key**: `remoteJid` (número de teléfono del cliente)
- **Value**: JSON con estructura:
  ```json
  {
    "conversacion_anterior": "Mensaje #1: Hola...\nRespuesta #1: ¡Hola!...\n[Accion anterior: solicitud_cita]"
  }
  ```

### Pinecone - Vector Store

Puedes agregar documentos al index `prueba` con información del negocio:
- Políticas de cancelación
- Instrucciones especiales
- Promociones
- FAQs

El bot usará esta info para responder preguntas.

## 🐛 Troubleshooting

### El bot no responde

1. **Verifica que el workflow esté activo** (botón "Active")
2. **Chequea las credenciales** (todas deben estar configuradas)
3. **Revisa los logs** en n8n: Settings → Executions

### Error: "OpenAI API Key no configurada"

Asegúrate de tener configurada la credencial:
- ID: `VnDDmVjIH0VsSkeT`
- Tipo: OpenAI API

### Error: "Redis connection failed"

Verifica que Redis esté corriendo:
```bash
redis-cli ping
# Debe responder: PONG
```

### Bot crea cita sin verificar disponibilidad

El prompt tiene instrucciones explícitas de verificar disponibilidad primero.
Si esto pasa, revisa el nodo "Question and Answer Chain" y asegúrate que el System Message incluya:

```
## IMPORTANTE - FLUJO DE TRABAJO:

### Para AGENDAR una cita:
1. **PRIMERO** usa la herramienta `consultar_disponibilidad` para verificar horarios disponibles
2. Muestra al cliente los horarios disponibles
3. Cuando el cliente elija un horario, **ENTONCES** usa `crear_cita` con esos datos
4. NUNCA crees una cita sin consultar disponibilidad primero
```

### Audios no se transcriben

1. Verifica credencial de Google Gemini: `Ynm6EOidl74pVSsS`
2. Chequea que el modelo sea: `models/gemini-2.5-flash`

### Imágenes no se analizan

1. Verifica credencial de OpenAI
2. Chequea que el nodo "Analyze image1" use modelo: `gpt-4o`

### Conversación no persiste

Verifica que los nodos Redis estén correctamente conectados:
- Redis3, Redis7, Redis9, Redis11 → guardan conversación
- Redis5, Redis6, Redis8, Redis10 → limpian conversación

## 💡 Tips

1. **Monitorea las ejecuciones**: Ve a Settings → Executions para ver cada interacción
2. **Prueba con Postman**: Envía mensajes al webhook para testear sin WhatsApp
3. **Ajusta el prompt**: Si el bot es muy verboso o muy breve, edita el System Message
4. **Llena Pinecone**: Agrega documentos con info del negocio para respuestas más ricas

## 📊 Diferencias con el Chatbot Original

| Característica | Original | Adaptado |
|----------------|----------|----------|
| Prompt | Cristina de estética genérica | Beauty Center con 8 servicios reales |
| Acciones | solicitud_cita, consulta_tratamiento, modificar_cita, conversacion_desfasada | consulta_servicios, consulta_disponibilidad, solicitud_cita, datos_cita_completos, cancelar_cita, consulta_resuelta |
| API Integration | HTTP Request a Pispas (incidencias) | HTTP Request a APIs de citas |
| Modelo IA | gpt-5 | gpt-4o-mini |
| Verificación disponibilidad | ❌ No | ✅ Sí, obligatorio antes de crear |

## 🎉 Ventajas del Chatbot Adaptado

1. ✅ **Memoria completa** - Redis guarda conversación por cliente
2. ✅ **Multimedia** - Procesa texto, audio (Gemini) e imágenes (GPT-4O)
3. ✅ **RAG con Pinecone** - Puede responder basado en docs del negocio
4. ✅ **Verificación de disponibilidad** - NO agenda citas en horarios ocupados
5. ✅ **Auto-crea clientes** - Backend hace upsert automático
6. ✅ **Cancela sin cita_id** - Solo necesita teléfono + fecha
7. ✅ **WhatsApp nativo** - Evolution API integrada
8. ✅ **Anti-duplicados** - Switch verifica timestamps para evitar procesar 2 veces

## 🚦 Próximos Pasos

1. **Importar el workflow** en n8n
2. **Configurar credenciales** (OpenAI, Pinecone, Redis, Evolution, Gemini)
3. **Activar el workflow**
4. **Probar con mensaje de prueba** vía Postman o WhatsApp
5. **Llenar Pinecone** con información del negocio
6. **Ajustar el prompt** según tus necesidades
7. **Conectar con WhatsApp Business** vía Evolution API

¡Listo para recibir citas! 🎊
