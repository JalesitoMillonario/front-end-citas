# 🤖 Chatbot de Citas con IA - n8n Workflow

Este es un chatbot inteligente con **AI Agent** que usa GPT-4o-mini para gestionar citas de forma conversacional.

## ✨ Características

- **Conversacional Natural** - Habla con el cliente como una persona real
- **Memoria de Contexto** - Recuerda toda la conversación (últimos 10 mensajes)
- **Verifica Disponibilidad SIEMPRE** - Nunca agenda sin verificar horarios libres
- **Auto-crea Clientes** - No necesitas crear clientes manualmente
- **Cancela por Teléfono** - Cancelación sencilla sin necesitar cita_id

## 🎯 Funcionalidades del Chatbot

### 1. Consultar Disponibilidad
Cliente: "Quiero ver disponibilidad para mañana"
Bot: *Consulta horarios libres y muestra opciones*

### 2. Agendar Cita
Cliente: "Quiero agendar una manicura mañana a las 10"
Bot: *Primero verifica disponibilidad, luego crea la cita*

### 3. Cancelar Cita
Cliente: "Necesito cancelar mi cita del viernes"
Bot: *Pide detalles (teléfono, fecha) y cancela la cita*

## 📋 Servicios Disponibles

El chatbot conoce estos servicios:

| Servicio | ID | Precio | Duración |
|----------|---|--------|-----------|
| Manicura | `563e5cc9-ff3c-4e7e-ba35-4d797017e32a` | 25€ | 60 min |
| Pedicura | `c4b5be70-2357-402f-8a4b-ad922a52e2b3` | 30€ | 60 min |
| Depilación Cejas | `5abb7e4e-61d3-4581-b297-0700d371bb26` | 10€ | 20 min |
| Masaje Facial | `bfcaa47b-6efe-48c2-939c-536d9ed6494f` | 40€ | 45 min |
| Limpieza Facial | `524f8e5c-eb10-4d1d-8dff-9f4c8b0fdeb3` | 50€ | 90 min |
| Depilación Piernas | `431a0e20-551e-4916-9991-da86ba5dfc6a` | 35€ | 45 min |
| Uñas de Gel | `d044cbcb-cc62-4729-addb-8e62e51e45b6` | 40€ | 90 min |
| Masaje Relajante | `7d0313e9-66e0-40a9-a3aa-ffe0d1216c12` | 60€ | 60 min |

## 🚀 Instalación

### 1. Importar en n8n

```bash
# Accede a n8n: http://34.57.154.181:5678
# Click en "+" → "Import from File"
# Selecciona: n8n-workflows/chatbot-citas-ai-agent.json
```

### 2. Configurar OpenAI API Key

En el nodo **"AI Agent"**:
1. Click en "Credentials"
2. Añade tu OpenAI API Key
3. Modelo configurado: `gpt-4o-mini`
4. Temperatura: `0.7`
5. Max Tokens: `500`

### 3. Activar el Workflow

1. Click en el botón "Active" en la esquina superior derecha
2. El webhook estará disponible en:
   ```
   http://34.57.154.181:5678/webhook/chatbot-citas
   ```

## 🔧 Estructura del Workflow

```
Webhook Chatbot (recibe mensaje)
    ↓
Extraer Datos (extrae session_id, user_message, user_phone)
    ↓
AI Agent (procesa con GPT-4o-mini)
    ├─→ Tool: Consultar Disponibilidad → API: Disponibilidad
    ├─→ Tool: Crear Cita → API: Crear Cita
    └─→ Tool: Cancelar Cita → API: Cancelar Cita
    + Memoria Conversación (recuerda contexto)
    ↓
Responder (devuelve respuesta al usuario)
```

## 💬 Ejemplos de Conversación

### Ejemplo 1: Agendar Cita

```
Cliente: Hola, necesito una cita para manicura

Bot: ¡Hola! 👋 Claro, te puedo ayudar con tu cita de manicura 💅
     ¿Para qué día te gustaría agendar?

Cliente: Para mañana

Bot: Perfecto, déjame ver la disponibilidad para mañana...
     ✅ Horarios disponibles:
     - 09:00
     - 09:30
     - 10:00
     - 11:00
     ...
     ¿Cuál prefieres?

Cliente: A las 10:00

Bot: Excelente! Para confirmar necesito:
     - Tu nombre completo
     - Número de teléfono
     - Email (opcional)

Cliente: María García, +34612345678, maria@email.com

Bot: ✅ CITA CREADA
     👤 María García
     💆‍♀️ Manicura
     📅 2026-01-19 a las 10:00
     💰 25€
     ¡Nos vemos mañana! ✨
```

### Ejemplo 2: Cancelar Cita

```
Cliente: Necesito cancelar mi cita

Bot: Claro, te ayudo a cancelar. Necesito:
     - Tu teléfono
     - Fecha de la cita

Cliente: +34612345678, mañana

Bot: ❌ CITA CANCELADA
     Cita cancelada exitosamente

     👤 Cliente: María García
     💆‍♀️ Servicio: Manicura
     📅 Fecha: 2026-01-19
     🕐 Hora: 10:00
```

## 🔑 API Endpoints Usados

El chatbot se conecta a estos endpoints:

### Consultar Disponibilidad
```http
GET http://34.57.154.181:5000/api/n8n/citas/disponibilidad?fecha=2026-01-19
X-API-Key: f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788
```

### Crear Cita
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

### Cancelar Cita
```http
POST http://34.57.154.181:5000/api/n8n/citas/cancelar-por-telefono
X-API-Key: f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788
Content-Type: application/json

{
  "telefono": "+34612345678",
  "fecha": "2026-01-19",
  "hora": "10:00",
  "motivo": "Cliente canceló"
}
```

## 🔐 Seguridad

- **API Key** - Todas las llamadas usan autenticación con API Key
- **Session ID** - Cada conversación tiene un ID único basado en el teléfono
- **Memoria Aislada** - Las conversaciones no se mezclan entre usuarios
- **TTL 1 hora** - La memoria se limpia después de 1 hora de inactividad

## ⚙️ Configuración Avanzada

### Cambiar Memoria

En el nodo **"Memoria Conversación"**:
- `sessionTimeToLive`: 3600 segundos (1 hora)
- `contextWindowLength`: 10 mensajes

### Personalizar Prompt

Edita el nodo **"AI Agent"** → "System Message" para:
- Cambiar personalidad del bot
- Añadir/quitar servicios
- Modificar flujo de conversación
- Añadir nuevas reglas

### Añadir Nuevas Herramientas

Para añadir más acciones:
1. Crea un nodo "Tool Workflow"
2. Configura nombre y descripción
3. Añade schema JSON de ejemplo
4. Conéctalo al AI Agent via "ai_tool"
5. Crea el HTTP Request correspondiente

## 🔌 Integración con WhatsApp/Telegram

### WhatsApp (usando Twilio/Evolution API)
```json
{
  "from": "+34612345678",
  "message": "Hola, quiero una cita"
}
```

### Telegram
```json
{
  "from": "123456789",
  "message": "Hola, quiero una cita",
  "chat_id": "123456789"
}
```

El webhook espera:
- `body.from` o `query.session_id` → session_id
- `body.message` o `body.text` o `query.message` → user_message
- `body.from` o `body.phone` o `query.phone` → user_phone

## 🐛 Troubleshooting

### Error: "OpenAI API Key no configurada"
- Verifica que hayas añadido las credenciales de OpenAI en el nodo AI Agent

### Error: "Webhook no responde"
- Verifica que el workflow esté "Active"
- Revisa los logs en n8n: Settings → Executions

### Error: "API Key no proporcionada"
- Verifica que todos los nodos HTTP tengan el header `X-API-Key`

### Bot no verifica disponibilidad antes de crear
- Revisa el System Message del AI Agent
- Asegúrate de que dice "PRIMERO usa consultar_disponibilidad"

### Bot olvida el contexto
- Verifica que el nodo "Memoria Conversación" esté conectado al AI Agent
- Chequea que `sessionKey` esté configurado: `={{ $json.session_id }}`

## 💡 Tips

1. **Para producción**: Activa "Save Execution Data" para debugging
2. **Para desarrollo**: Usa el modo "Manual" para probar sin webhook
3. **Para testing**: Usa Postman o curl para enviar mensajes de prueba
4. **Para mejorar**: Analiza las ejecuciones para ver qué herramientas usa el bot

## 📊 Monitoreo

Revisa las métricas en n8n:
- Número de ejecuciones
- Tiempo de respuesta
- Tasa de error
- Uso de herramientas

## 🚦 Límites

- **OpenAI Rate Limits**: Según tu plan de OpenAI
- **Max Tokens**: 500 por respuesta (ajustable)
- **Memoria**: 10 mensajes de contexto (ajustable)
- **Session TTL**: 1 hora (ajustable)

## 📞 Próximos Pasos

1. **Integrar con WhatsApp Business API**
2. **Añadir tool "listar_citas"** para que los clientes vean sus citas
3. **Añadir tool "modificar_cita"** para reprogramar
4. **Integrar con sistema de pagos**
5. **Añadir recordatorios automáticos**

## 🎉 ¡Listo para Usar!

El chatbot está completamente funcional y listo para recibir mensajes. Solo necesitas:
1. Importar el workflow
2. Configurar OpenAI API Key
3. Activarlo
4. ¡Empezar a recibir mensajes!
