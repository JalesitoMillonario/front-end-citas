import cron from 'node-cron';
import axios from 'axios';
import { getAll, run } from '../database/db.js';

// Función para enviar recordatorio a n8n
async function enviarRecordatorioN8n(cita, negocio) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('⚠️  N8N_WEBHOOK_URL no configurado, saltando envío de recordatorio');
      return false;
    }

    const payload = {
      tipo: 'recordatorio_cita',
      cita: {
        cita_id: cita.cita_id,
        fecha: cita.fecha,
        hora: cita.hora_inicio,
        servicio: cita.servicio_nombre,
        notas: cita.notas,
      },
      cliente: {
        nombre: cita.cliente_nombre,
        telefono: cita.cliente_telefono,
        email: cita.cliente_email,
      },
      negocio: {
        tenant_id: negocio.tenant_id,
        nombre: negocio.nombre_negocio,
        telefono: negocio.telefono,
        direccion: negocio.direccion,
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`📤 Enviando recordatorio a n8n para cita ${cita.cita_id}...`);

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': negocio.tenant_id,
      },
      timeout: 10000,
    });

    console.log(`✅ Recordatorio enviado exitosamente para cita ${cita.cita_id}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar recordatorio para cita ${cita.cita_id}:`, error.message);
    return false;
  }
}

// Función para procesar recordatorios pendientes
async function procesarRecordatorios() {
  try {
    const horasAntes = parseInt(process.env.REMINDER_HOURS_BEFORE || '12', 10);

    // Calcular timestamp de referencia (ahora + X horas)
    const ahora = new Date();
    const referencia = new Date(ahora.getTime() + horasAntes * 60 * 60 * 1000);

    const fechaReferencia = referencia.toISOString().split('T')[0];
    const horaReferencia = `${String(referencia.getHours()).padStart(2, '0')}:${String(referencia.getMinutes()).padStart(2, '0')}`;

    // Buscar citas que necesitan recordatorio
    // (citas que están entre ahora+12h y ahora+12h+30min)
    const horaReferenciaMax = new Date(referencia.getTime() + 30 * 60 * 1000);
    const horaMaxStr = `${String(horaReferenciaMax.getHours()).padStart(2, '0')}:${String(horaReferenciaMax.getMinutes()).padStart(2, '0')}`;

    const citasPendientes = getAll(
      `SELECT
        c.*,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        s.nombre as servicio_nombre
       FROM citas c
       JOIN clientes cl ON c.cliente_id = cl.cliente_id
       JOIN servicios s ON c.servicio_id = s.servicio_id
       WHERE c.recordatorio_enviado = 0
       AND c.estado IN ('pendiente', 'confirmada')
       AND (
         (c.fecha = ? AND c.hora_inicio >= ? AND c.hora_inicio <= ?) OR
         (c.fecha > ?)
       )
       LIMIT 50`,
      [fechaReferencia, horaReferencia, horaMaxStr, fechaReferencia]
    );

    if (citasPendientes.length === 0) {
      console.log('📭 No hay recordatorios pendientes');
      return;
    }

    console.log(`📬 Procesando ${citasPendientes.length} recordatorios...`);

    for (const cita of citasPendientes) {
      // Obtener datos del negocio
      const negocio = getAll(
        'SELECT * FROM negocios WHERE tenant_id = ?',
        [cita.tenant_id]
      )[0];

      if (!negocio) {
        console.warn(`⚠️  Negocio no encontrado para cita ${cita.cita_id}`);
        continue;
      }

      // Enviar recordatorio a n8n
      const enviado = await enviarRecordatorioN8n(cita, negocio);

      // Marcar como enviado
      if (enviado) {
        run(
          'UPDATE citas SET recordatorio_enviado = 1 WHERE cita_id = ?',
          [cita.cita_id]
        );
      }

      // Pequeña pausa entre recordatorios para no saturar
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('✅ Recordatorios procesados');
  } catch (error) {
    console.error('❌ Error al procesar recordatorios:', error);
  }
}

// Iniciar cron job para revisar recordatorios cada 30 minutos
export function iniciarSistemaRecordatorios() {
  console.log('🕐 Iniciando sistema de recordatorios...');
  console.log(`⏰ Recordatorios se enviarán ${process.env.REMINDER_HOURS_BEFORE || 12} horas antes de cada cita`);

  // Ejecutar cada 30 minutos
  cron.schedule('*/30 * * * *', () => {
    console.log('\n🔔 Revisando recordatorios pendientes...');
    procesarRecordatorios();
  });

  // Ejecutar inmediatamente al iniciar (útil para testing)
  setTimeout(() => {
    console.log('🔔 Ejecutando verificación inicial de recordatorios...');
    procesarRecordatorios();
  }, 5000);

  console.log('✅ Sistema de recordatorios iniciado');
}

// Función para testing manual
export async function enviarRecordatorioManual(citaId) {
  try {
    const cita = getAll(
      `SELECT
        c.*,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        s.nombre as servicio_nombre
       FROM citas c
       JOIN clientes cl ON c.cliente_id = cl.cliente_id
       JOIN servicios s ON c.servicio_id = s.servicio_id
       WHERE c.cita_id = ?`,
      [citaId]
    )[0];

    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    const negocio = getAll(
      'SELECT * FROM negocios WHERE tenant_id = ?',
      [cita.tenant_id]
    )[0];

    if (!negocio) {
      throw new Error('Negocio no encontrado');
    }

    const enviado = await enviarRecordatorioN8n(cita, negocio);

    if (enviado) {
      run('UPDATE citas SET recordatorio_enviado = 1 WHERE cita_id = ?', [citaId]);
    }

    return { success: enviado };
  } catch (error) {
    console.error('Error al enviar recordatorio manual:', error);
    return { success: false, error: error.message };
  }
}
