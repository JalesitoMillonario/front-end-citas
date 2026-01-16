# Sistema de Gestión de Citas Multi-Tenant

Sistema web completo de gestión de citas para negocios (estéticas, fisioterapias, peluquerías, etc.) con soporte multi-tenant.

## 🚀 Características

- **Multi-tenant**: Cada negocio tiene su propia cuenta y panel de control
- **Autenticación**: Login con Google OAuth
- **Gestión de Citas**: Crear, editar, cancelar y gestionar citas
- **Gestión de Servicios**: Configura los servicios que ofreces
- **Gestión de Clientes**: Base de datos de clientes (Fase 2)
- **Calendario Visual**: Vista de calendario de citas (Fase 2)
- **Integración con n8n**: API para chatbot de WhatsApp

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + Vite
- **Estilos**: Tailwind CSS v4
- **Routing**: React Router v6
- **Autenticación**: Google OAuth (@react-oauth/google)
- **Iconos**: Lucide React
- **Fechas**: date-fns
- **HTTP Client**: Axios
- **Calendario**: React Big Calendar

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Google Cloud (para OAuth)
- n8n (para backend/API)

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone <url-repositorio>
cd front-end-citas
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Edita `.env` y configura:
- `VITE_GOOGLE_CLIENT_ID`: Tu Client ID de Google OAuth
- `VITE_API_BASE_URL`: URL de tu API (n8n webhooks)

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## 🔑 Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Configura los orígenes autorizados:
   - `http://localhost:5173` (desarrollo)
   - Tu dominio de producción
6. Copia el Client ID y pégalo en `.env`

## 📡 API Endpoints (n8n)

El sistema espera estos endpoints en n8n:

### Autenticación
- `POST /api/auth/google` - Login con Google
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Citas
- `POST /api/citas/crear` - Crear cita
- `GET /api/citas/listar` - Listar citas
- `GET /api/citas/:id` - Obtener cita
- `PUT /api/citas/actualizar/:id` - Actualizar cita
- `DELETE /api/citas/cancelar/:id` - Cancelar cita
- `GET /api/citas/disponibilidad` - Verificar disponibilidad

### Clientes
- `POST /api/clientes/crear` - Crear cliente
- `GET /api/clientes/listar` - Listar clientes
- `GET /api/clientes/buscar` - Buscar cliente
- `GET /api/clientes/:id` - Obtener cliente
- `PUT /api/clientes/actualizar/:id` - Actualizar cliente

### Servicios
- `GET /api/servicios/listar` - Listar servicios
- `POST /api/servicios/crear` - Crear servicio
- `GET /api/servicios/:id` - Obtener servicio
- `PUT /api/servicios/actualizar/:id` - Actualizar servicio
- `DELETE /api/servicios/:id` - Eliminar servicio

### Configuración
- `GET /api/negocio/config` - Obtener configuración
- `PUT /api/negocio/config` - Actualizar configuración
- `GET /api/negocio/horario` - Obtener horario
- `PUT /api/negocio/horario` - Actualizar horario

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── layout/         # Layout, Sidebar, Header
│   ├── dashboard/      # Componentes del dashboard
│   ├── appointments/   # Componentes de citas
│   ├── clients/        # Componentes de clientes
│   ├── services/       # Componentes de servicios
│   └── settings/       # Componentes de configuración
├── pages/              # Páginas principales
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Appointments.jsx
│   ├── Clients.jsx
│   ├── Services.jsx
│   ├── Calendar.jsx
│   └── Settings.jsx
├── hooks/              # Custom hooks
│   ├── useAuth.js
│   ├── useAppointments.js
│   ├── useClients.js
│   └── useServices.js
├── context/            # Context API
│   ├── AuthContext.jsx
│   └── TenantContext.jsx
├── services/           # Servicios API
│   └── api.js
├── utils/              # Utilidades
│   ├── dateHelpers.js
│   └── formatters.js
└── App.jsx             # Componente principal
```

## 🚧 Roadmap

### ✅ Fase 1 (MVP - Completado)
- [x] Login con Google OAuth
- [x] Dashboard básico
- [x] Gestión de citas (crear, listar, editar, cancelar)
- [x] Gestión de servicios
- [x] API endpoints para n8n

### ✅ Fase 2 (Completado)
- [x] Calendario visual con drag & drop
- [x] Gestión completa de clientes
- [x] Configuración del negocio
- [x] Configuración de horarios

### 📅 Fase 3 (Futuro)
- [ ] Onboarding completo para nuevos usuarios
- [ ] Sistema de notificaciones
- [ ] Estadísticas y reportes
- [ ] Exportación de datos
- [ ] Recordatorios automáticos

## 🤝 Integración con Chatbot (n8n)

Para conectar un nuevo cliente al chatbot:

1. El cliente se registra en el sistema
2. Obtener su `tenant_id` desde Configuración
3. Configurar en n8n:
   - `TENANT_ID`: Identificador del negocio
   - `API_KEY`: Clave de API del cliente
   - `WEBHOOK_BASE_URL`: URL base del sistema
   - `NOMBRE_NEGOCIO`: Nombre para el bot

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter
```

## 📄 Licencia

MIT

## 👥 Autor

Sistema desarrollado para gestión de citas multi-tenant
