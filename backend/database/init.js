import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'citas.db'));

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

console.log('🗄️  Inicializando base de datos...');

// Tabla: Negocios (Tenants)
db.exec(`
  CREATE TABLE IF NOT EXISTS negocios (
    tenant_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre_negocio TEXT NOT NULL,
    tipo_negocio TEXT,
    direccion TEXT,
    telefono TEXT,
    logo_url TEXT,
    api_key TEXT UNIQUE NOT NULL,
    horario TEXT, -- JSON
    config TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabla: Servicios
db.exec(`
  CREATE TABLE IF NOT EXISTS servicios (
    servicio_id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    duracion INTEGER NOT NULL, -- minutos
    precio REAL NOT NULL,
    categoria TEXT,
    activo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES negocios(tenant_id) ON DELETE CASCADE
  )
`);

// Tabla: Clientes
db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    cliente_id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT,
    notas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES negocios(tenant_id) ON DELETE CASCADE
  )
`);

// Tabla: Citas
db.exec(`
  CREATE TABLE IF NOT EXISTS citas (
    cita_id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    cliente_id TEXT NOT NULL,
    servicio_id TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado TEXT DEFAULT 'pendiente', -- pendiente, confirmada, completada, cancelada, no_show
    notas TEXT,
    created_by TEXT DEFAULT 'manual', -- manual, chatbot, api
    recordatorio_enviado BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES negocios(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(servicio_id) ON DELETE CASCADE
  )
`);

// Índices para mejorar rendimiento
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_citas_tenant ON citas(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
  CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
  CREATE INDEX IF NOT EXISTS idx_citas_recordatorio ON citas(recordatorio_enviado, fecha, hora_inicio);
  CREATE INDEX IF NOT EXISTS idx_servicios_tenant ON servicios(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_clientes_tenant ON clientes(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(tenant_id, telefono);
`);

console.log('✅ Base de datos inicializada correctamente');
console.log('📊 Tablas creadas: negocios, servicios, clientes, citas');

db.close();
