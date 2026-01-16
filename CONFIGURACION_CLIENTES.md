# 🎯 Guía de Configuración para Nuevos Clientes

Esta guía explica cómo configurar el sistema para cada nuevo cliente (negocio) de forma rápida y sencilla.

## ✅ Concepto Multi-Tenant

- **Un único frontend** sirve a todos los clientes
- **Un único backend** maneja todos los negocios
- **Cada cliente tiene su propia configuración**:
  - URL de webhook personalizada
  - Horarios personalizados
  - Configuración de recordatorios personalizada
  - API Key única

## 🚀 Proceso para Agregar un Nuevo Cliente

### Paso 1: El Cliente se Registra

1. El cliente va a tu URL del frontend (ej: `https://tucitas.com`)
2. Click en "Iniciar sesión con Google"
3. El sistema automáticamente:
   - Crea su cuenta (tenant)
   - Genera su API Key único
   - Genera su Tenant ID

¡Ya está registrado! 🎉

### Paso 2: Configuración Inicial (Cliente lo hace)

El cliente debe completar su configuración en el frontend:

#### 2.1. Datos del Negocio
`Configuración → Datos del Negocio`

- Nombre del negocio
- Tipo de negocio (Estética, Peluquería, etc.)
- Dirección
- Teléfono de contacto
- Logo (opcional)

#### 2.2. Horarios de Apertura
`Configuración → Horarios`

- Días de la semana que abre
- Hora de apertura y cierre por día
- Pausas (ej: comida de 14:00 a 16:00)

#### 2.3. Servicios
`Servicios → Nuevo Servicio`

Agregar los servicios que ofrece:
- Nombre (ej: "Corte de cabello")
- Duración (ej: 30 minutos)
- Precio (ej: 15€)

### Paso 3: Configuración Avanzada (TÚ lo configuras)

Esta es la parte que configuras TÚ para cada cliente:

#### 3.1. Obtener Credenciales

`Configuración → Integración n8n`

El cliente debe copiar y darte:
- **Tenant ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **API Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 3.2. Crear Workflow n8n para el Cliente

En n8n, crea un workflow específico para este cliente:

**a) Webhook para Recordatorios**
```
URL: https://tu-n8n.com/webhook/recordatorio-[nombre-cliente]
```

Este webhook recibirá los recordatorios automáticos.

**Ejemplo de flujo:**
```
Webhook → Extraer datos → Enviar WhatsApp → Responder OK
```

**b) Endpoints para Chatbot WhatsApp** (opcional)

Si el cliente quiere chatbot:

1. **Consultar disponibilidad:**
```javascript
HTTP Request Node:
URL: https://tu-api.com/api/n8n/citas/disponibilidad
Headers:
  X-API-Key: [api_key_del_cliente]
Query:
  fecha: {{$json.fecha}}
  servicio_id: {{$json.servicio_id}}
```

2. **Crear cita:**
```javascript
HTTP Request Node:
URL: https://tu-api.com/api/n8n/citas/crear
Method: POST
Headers:
  X-API-Key: [api_key_del_cliente]
Body:
  {
    "cliente_nombre": "{{$json.nombre}}",
    "cliente_telefono": "{{$json.telefono}}",
    "servicio_id": "{{$json.servicio_id}}",
    "fecha": "{{$json.fecha}}",
    "hora": "{{$json.hora}}"
  }
```

#### 3.3. Configurar en el Frontend

`Configuración → Configuración Avanzada`

Aquí el cliente configura:

- ✅ **URL del Webhook**: `https://tu-n8n.com/webhook/recordatorio-[nombre-cliente]`
- ✅ **Activar recordatorios**: Sí
- ✅ **Horas antes**: 12 horas (o lo que prefiera)
- ✅ **Enviar confirmación automática**: Sí
- ✅ **Permitir cancelación por WhatsApp**: Sí
- ✅ **Tiempo mínimo para cancelar**: 2 horas

**Botón "Probar Webhook"** → Verifica que n8n recibe correctamente

¡Listo! El cliente ya está configurado ✅

---

## 📋 Checklist de Configuración

Para cada nuevo cliente, verifica:

### En el Frontend:
- [ ] Cliente registrado con Google
- [ ] Datos del negocio completados
- [ ] Horarios configurados
- [ ] Al menos 1 servicio creado
- [ ] API Key obtenida

### En n8n:
- [ ] Webhook de recordatorios creado
- [ ] Workflow de recordatorios funciona
- [ ] (Opcional) Chatbot WhatsApp conectado
- [ ] Test de envío realizado

### En Configuración Avanzada:
- [ ] URL de webhook configurada
- [ ] Test de webhook exitoso ✅
- [ ] Recordatorios activados
- [ ] Horas antes configuradas

---

## 🔄 Flujo Completo de Ejemplo

### Ejemplo: "Peluquería María"

**1. María se registra:**
- Va a `https://tucitas.com`
- Login con Google
- Email: `maria@peluqueria.com`
- ✅ Tenant ID y API Key generados automáticamente

**2. María configura su negocio:**
- Nombre: "Peluquería María"
- Tipo: Peluquería
- Horario: Lun-Vie 9:00-19:00, Sab 9:00-14:00
- Servicios:
  - Corte señora (45min, 25€)
  - Corte caballero (30min, 15€)
  - Tinte (120min, 50€)

**3. TÚ configuras n8n:**
- Creas webhook: `https://tu-n8n.com/webhook/recordatorio-maria`
- Conectas WhatsApp Business API
- Template de mensaje:
  ```
  ¡Hola {{cliente.nombre}}! 👋

  Te recordamos tu cita en Peluquería María:
  📅 {{cita.fecha}}
  🕐 {{cita.hora}}
  💇 {{cita.servicio}}

  📍 Calle Mayor 123, Madrid
  📞 600 111 222

  ¡Te esperamos! 😊
  ```

**4. María configura avanzado:**
- Pega URL del webhook
- Prueba → ✅ Funciona
- Activa recordatorios: 12 horas antes
- Guarda

**5. ¡Sistema funcionando!**
- María crea citas desde el frontend
- Clientes reservan por WhatsApp
- 12 horas antes → n8n envía recordatorio automático
- Todo aislado de otros negocios

---

## 🎨 Personalización por Cliente

Cada cliente puede tener:

### Recordatorios Personalizados:
- Cliente A: 24 horas antes
- Cliente B: 12 horas antes
- Cliente C: 2 horas antes
- Cliente D: Desactivados

### Webhooks Diferentes:
- Cliente A: n8n propio
- Cliente B: Zapier
- Cliente C: Make (Integromat)
- Cliente D: Tu servidor custom

### Políticas Diferentes:
- Cliente A: Permite cancelar hasta 2h antes
- Cliente B: Permite cancelar hasta 24h antes
- Cliente C: No permite cancelar por WhatsApp

---

## ⚠️ Importante

### Configuración por Tenant
- Cada configuración es **independiente**
- Los cambios **NO afectan** a otros clientes
- Cada webhook es **único** por cliente

### Seguridad
- Cada API Key es **único** y **secreto**
- No compartir API Keys entre clientes
- El Tenant ID aísla completamente los datos

### Testing
- **Siempre** probar el webhook antes de activar
- Hacer una cita de prueba y verificar recordatorio
- Confirmar que WhatsApp llega correctamente

---

## 🆘 Troubleshooting

### El recordatorio no llega

1. Verificar que recordatorios están **activados**
2. Verificar URL del webhook es correcta
3. Probar webhook con botón "Probar Webhook"
4. Revisar logs de n8n
5. Verificar que la cita es en las próximas X horas configuradas

### El chatbot no crea citas

1. Verificar API Key en n8n
2. Verificar URL de la API
3. Verificar que el servicio_id existe
4. Revisar logs del backend
5. Probar endpoint con cURL/Postman

### Error "Tenant no encontrado"

1. Verificar Tenant ID es correcto
2. Verificar que el usuario hizo login
3. Limpiar caché del navegador

---

## 📞 Soporte

Si tienes dudas:
1. Revisa los logs del backend: `backend/` → logs
2. Revisa los logs de n8n
3. Usa el endpoint de testing: `POST /api/test/recordatorio/:citaId`

---

## 🎯 Resumen: Agregar Cliente en 3 Pasos

1. **Cliente se registra** → Automático
2. **Cliente configura** → Negocio, horarios, servicios
3. **TÚ configuras avanzado** → n8n + webhook URL

¡Y listo! 🚀
