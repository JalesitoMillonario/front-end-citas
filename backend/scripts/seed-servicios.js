import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../database/citas.db'));

// Obtener el tenant_id del primer negocio
const negocio = db.prepare('SELECT tenant_id FROM negocios LIMIT 1').get();

if (!negocio) {
  console.log('❌ No se encontró ningún negocio. Primero debes registrarte en el frontend.');
  process.exit(1);
}

const tenantId = negocio.tenant_id;
console.log(`\n🏢 Insertando servicios para tenant: ${tenantId}\n`);

// Servicios de prueba para centro de estética
const servicios = [
  {
    nombre: 'Manicura',
    descripcion: 'Manicura completa con esmaltado',
    precio: 25,
    duracion: 60,
    categoria: 'Manos'
  },
  {
    nombre: 'Pedicura',
    descripcion: 'Pedicura completa con esmaltado',
    precio: 30,
    duracion: 60,
    categoria: 'Pies'
  },
  {
    nombre: 'Depilación Cejas',
    descripcion: 'Depilación y diseño de cejas',
    precio: 10,
    duracion: 20,
    categoria: 'Depilación'
  },
  {
    nombre: 'Masaje Facial',
    descripcion: 'Masaje facial relajante con cremas hidratantes',
    precio: 40,
    duracion: 45,
    categoria: 'Facial'
  },
  {
    nombre: 'Limpieza Facial',
    descripcion: 'Limpieza profunda facial con extracción',
    precio: 50,
    duracion: 90,
    categoria: 'Facial'
  },
  {
    nombre: 'Depilación Piernas Completas',
    descripcion: 'Depilación con cera de piernas completas',
    precio: 35,
    duracion: 45,
    categoria: 'Depilación'
  },
  {
    nombre: 'Uñas de Gel',
    descripcion: 'Aplicación de uñas de gel',
    precio: 40,
    duracion: 90,
    categoria: 'Manos'
  },
  {
    nombre: 'Masaje Relajante',
    descripcion: 'Masaje corporal relajante de 60 minutos',
    precio: 60,
    duracion: 60,
    categoria: 'Masajes'
  }
];

const stmt = db.prepare(`
  INSERT INTO servicios (tenant_id, nombre, descripcion, precio, duracion, activo, categoria)
  VALUES (?, ?, ?, ?, ?, 1, ?)
`);

let insertados = 0;

servicios.forEach(servicio => {
  try {
    // Verificar si ya existe
    const existe = db.prepare('SELECT servicio_id FROM servicios WHERE tenant_id = ? AND nombre = ?')
      .get(tenantId, servicio.nombre);

    if (existe) {
      console.log(`⏭️  ${servicio.nombre} - Ya existe`);
    } else {
      stmt.run(
        tenantId,
        servicio.nombre,
        servicio.descripcion,
        servicio.precio,
        servicio.duracion,
        servicio.categoria
      );
      console.log(`✅ ${servicio.nombre} - ${servicio.precio}€ (${servicio.duracion} min)`);
      insertados++;
    }
  } catch (error) {
    console.error(`❌ Error insertando ${servicio.nombre}:`, error.message);
  }
});

console.log(`\n📊 Resumen:`);
console.log(`   Servicios insertados: ${insertados}`);
console.log(`   Total de servicios: ${servicios.length}`);

// Mostrar todos los servicios
console.log(`\n📋 Servicios en la base de datos:\n`);
const todosServicios = db.prepare('SELECT * FROM servicios WHERE tenant_id = ?').all(tenantId);
todosServicios.forEach((s, i) => {
  console.log(`${i + 1}. [ID: ${s.servicio_id}] ${s.nombre} - ${s.precio}€ (${s.duracion} min)`);
});

db.close();

console.log(`\n✅ Servicios listos para usar en n8n!`);
console.log(`\n🔍 Ahora puedes ejecutar el workflow en n8n con servicio_id = 1\n`);
