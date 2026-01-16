import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Controladores
import * as citasController from './controllers/citasController.js';
import * as serviciosController from './controllers/serviciosController.js';
import * as clientesController from './controllers/clientesController.js';
import * as authController from './controllers/authController.js';

// Middleware
import { verifyToken, verifyTenant, verifyApiKey } from './middleware/auth.js';

// Sistema de recordatorios
import { iniciarSistemaRecordatorios, enviarRecordatorioManual } from './utils/reminders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Logger simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ==================== RUTAS PÚBLICAS ====================

app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestión de Citas Multi-Tenant',
    version: '1.0.0',
    status: 'online',
  });
});

// Autenticación
app.post('/api/auth/google', authController.loginGoogle);

// ==================== RUTAS PROTEGIDAS (Frontend) ====================

// Requieren JWT token del usuario
app.get('/api/auth/me', verifyToken, authController.getCurrentUser);

// Configuración del negocio
app.get('/api/negocio/config', verifyTenant, authController.obtenerConfig);
app.put('/api/negocio/config', verifyTenant, authController.actualizarConfig);
app.put('/api/negocio/horario', verifyTenant, authController.actualizarHorario);

// Citas (Frontend)
app.post('/api/citas/crear', verifyTenant, citasController.crearCita);
app.get('/api/citas/listar', verifyTenant, citasController.listarCitas);
app.get('/api/citas/disponibilidad', verifyTenant, citasController.consultarDisponibilidad);
app.get('/api/citas/:id', verifyTenant, citasController.obtenerCita);
app.put('/api/citas/actualizar/:id', verifyTenant, citasController.actualizarCita);
app.delete('/api/citas/cancelar/:id', verifyTenant, citasController.cancelarCita);

// Servicios
app.get('/api/servicios/listar', verifyTenant, serviciosController.listarServicios);
app.post('/api/servicios/crear', verifyTenant, serviciosController.crearServicio);
app.put('/api/servicios/actualizar/:id', verifyTenant, serviciosController.actualizarServicio);
app.delete('/api/servicios/:id', verifyTenant, serviciosController.eliminarServicio);

// Clientes
app.get('/api/clientes/listar', verifyTenant, clientesController.listarClientes);
app.post('/api/clientes/crear', verifyTenant, clientesController.crearCliente);
app.get('/api/clientes/buscar', verifyTenant, clientesController.buscarCliente);
app.put('/api/clientes/actualizar/:id', verifyTenant, clientesController.actualizarCliente);

// ==================== RUTAS PARA N8N ====================

// Estas rutas usan API Key en lugar de JWT
// n8n debe enviar el header: X-API-Key: <api_key>

// Crear cita desde n8n (chatbot)
app.post('/api/n8n/citas/crear', verifyApiKey, (req, res) => {
  req.body.created_by = 'chatbot';
  citasController.crearCita(req, res);
});

// Consultar disponibilidad desde n8n
app.get('/api/n8n/citas/disponibilidad', verifyApiKey, citasController.consultarDisponibilidad);

// Listar citas desde n8n
app.get('/api/n8n/citas/listar', verifyApiKey, citasController.listarCitas);

// Cancelar cita desde n8n
app.delete('/api/n8n/citas/cancelar/:id', verifyApiKey, citasController.cancelarCita);

// Actualizar cita desde n8n
app.put('/api/n8n/citas/actualizar/:id', verifyApiKey, citasController.actualizarCita);

// Buscar cliente por teléfono (para chatbot)
app.get('/api/n8n/clientes/buscar', verifyApiKey, clientesController.buscarCliente);

// Crear cliente desde n8n
app.post('/api/n8n/clientes/crear', verifyApiKey, clientesController.crearCliente);

// Listar servicios (para chatbot)
app.get('/api/n8n/servicios/listar', verifyApiKey, serviciosController.listarServicios);

// ==================== ENDPOINTS DE TESTING ====================

// Enviar recordatorio manual (para testing)
app.post('/api/test/recordatorio/:citaId', verifyTenant, async (req, res) => {
  try {
    const { citaId } = req.params;
    const result = await enviarRecordatorioManual(citaId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor iniciado en http://localhost:${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? '✓ Configurado' : '✗ No configurado'}`);
  console.log(`🪝 N8N Webhook: ${process.env.N8N_WEBHOOK_URL || '✗ No configurado'}`);
  console.log('\n📚 Documentación de endpoints:');
  console.log('   Frontend: http://localhost:' + PORT + '/api/*');
  console.log('   n8n:      http://localhost:' + PORT + '/api/n8n/*');
  console.log('\n🔔 Iniciando sistema de recordatorios...\n');

  // Iniciar sistema de recordatorios
  iniciarSistemaRecordatorios();
});

export default app;
