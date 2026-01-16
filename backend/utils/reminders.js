import cron from 'node-cron';
import { getAll, run } from '../database/db.js';
import { webhookRecordatorio } from './webhooks.js';

// Función para enviar recordatorio a n8n usando la configuración del tenant
async function enviarRecordatorioN8n(cita, negocio) {
  try {
    // Obtener configuración del negocio
    const config = negocio.config ? JSON.parse(negocio.config) : {};

    // Verificar si los recordatorios están activos para este negocio
    if (config.recordatorio_activo === false) {
      console.log(`⏸️  Recordatorios desactivados para negocio ${negocio.tenant_id}`);
      return false;
    }

    // Usar el módulo centralizado de webhooks
    console.log(`📤 Enviando recordatorio para cita ${cita.cita_id} (${negocio.nombre_negocio})...`);

    const enviado = await webhookRecordatorio(negocio.tenant_id, cita, negocio);

    if (enviado) {
      console.log(`✅ Recordatorio enviado exitosamente para cita ${cita.cita_id}`);
    }
    return enviado;
  } catch (error) {
    console.error(`❌ Error al enviar recordatorio para cita ${cita.cita_id}:`, error.message);
    return false;
  }
}

// Función para procesar recordatorios pendientes por tenant
async function procesarRecordatoriosPorTenant(negocio) {
  try {
    // Obtener configuración del negocio
    const config = negocio.config ? JSON.parse(negocio.config) : {};

    // Verificar si recordatorios están activos
    if (config.recordatorio_activo === false) {
      return 0;
    }

    // Obtener horas antes (específico del tenant o default)
    const horasAntes = config.recordatorio_horas_antes ||
                       parseInt(process.env.REMINDER_HOURS_BEFORE || '12', 10);

    // Calcular timestamp de referencia (ahora + X horas)
    const ahora = new Date();
    const referencia = new Date(ahora.getTime() + horasAntes * 60 * 60 * 1000);

    const fechaReferencia = referencia.toISOString().split('T')[0];
    const horaReferencia = `${String(referencia.getHours()).padStart(2, '0')}:${String(referencia.getMinutes()).padStart(2, '0')}`;

    // Buscar citas que necesitan recordatorio para este tenant
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
       WHERE c.tenant_id = ?
       AND c.recordatorio_enviado = 0
       AND c.estado IN ('pendiente', 'confirmada')
       AND (
         (c.fecha = ? AND c.hora_inicio >= ? AND c.hora_inicio <= ?) OR
         (c.fecha > ?)
       )
       LIMIT 20`,
      [negocio.tenant_id, fechaReferencia, horaReferencia, horaMaxStr, fechaReferencia]
    );

    if (citasPendientes.length === 0) {
      return 0;
    }

    console.log(`📬 Procesando ${citasPendientes.length} recordatorios para ${negocio.nombre_negocio}...`);

    let enviados = 0;

    for (const cita of citasPendientes) {
      // Enviar recordatorio a n8n
      const enviado = await enviarRecordatorioN8n(cita, negocio);

      // Marcar como enviado
      if (enviado) {
        run(
          'UPDATE citas SET recordatorio_enviado = 1 WHERE cita_id = ?',
          [cita.cita_id]
        );
        enviados++;
      }

      // Pequeña pausa entre recordatorios para no saturar
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return enviados;
  } catch (error) {
    console.error(`❌ Error al procesar recordatorios para tenant ${negocio.tenant_id}:`, error);
    return 0;
  }
}

// Función para procesar todos los recordatorios pendientes
async function procesarRecordatorios() {
  try {
    console.log('\n🔔 Revisando recordatorios pendientes...');

    // Obtener todos los negocios activos
    const negocios = getAll('SELECT * FROM negocios');

    if (negocios.length === 0) {
      console.log('📭 No hay negocios registrados');
      return;
    }

    console.log(`🏢 Revisando ${negocios.length} negocios...`);

    let totalEnviados = 0;

    for (const negocio of negocios) {
      const enviados = await procesarRecordatoriosPorTenant(negocio);
      totalEnviados += enviados;

      // Pausa entre negocios
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (totalEnviados > 0) {
      console.log(`✅ Total de recordatorios enviados: ${totalEnviados}`);
    } else {
      console.log('📭 No hay recordatorios pendientes');
    }
  } catch (error) {
    console.error('❌ Error al procesar recordatorios:', error);
  }
}

// Iniciar cron job para revisar recordatorios cada 30 minutos
export function iniciarSistemaRecordatorios() {
  console.log('🕐 Iniciando sistema de recordatorios multi-tenant...');
  console.log('⏰ Cada negocio tiene su propia configuración de recordatorios');

  // Ejecutar cada 30 minutos
  cron.schedule('*/30 * * * *', () => {
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
