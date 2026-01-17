import { getOne } from '../database/db.js';

const negocio = getOne('SELECT email, api_key, tenant_id FROM negocios LIMIT 1');

if (negocio) {
  console.log('\n🔑 Credenciales para n8n:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email:      ', negocio.email);
  console.log('Tenant ID:  ', negocio.tenant_id);
  console.log('API Key:    ', negocio.api_key);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📝 Usa este API Key en n8n con el header:');
  console.log('   X-API-Key:', negocio.api_key);
  console.log('\n');
} else {
  console.log('❌ No se encontraron negocios en la base de datos');
}

process.exit(0);
