import axios from 'axios';
import { getOne } from '../database/db.js';

/**
 * Tipos de eventos disponibles para webhooks
 */
export const EVENTOS_WEBHOOK = {
  CITA_CREADA: 'cita_creada',
  CITA_ACTUALIZADA: 'cita_actualizada',
  CITA_CANCELADA: 'cita_cancelada',
  CITA_CONFIRMADA: 'cita_confirmada',
  CITA_COMPLETADA: 'cita_completada',
  RECORDATORIO_ENVIADO: 'recordatorio_enviado',
  CLIENTE_CREADO: 'cliente_creado',
  SERVICIO_CREADO: 'servicio_creado',
};

/**
 * Envía un webhook UNIFICADO a n8n con información del evento
 * TODOS los eventos van al mismo webhook
 * @param {string} tenantId - ID del tenant
 * @param {string} tipoEvento - Tipo de evento (usar EVENTOS_WEBHOOK)
 * @param {object} datos - Datos del evento
 * @returns {Promise<boolean>} - true si se envió correctamente
 */
export async function enviarWebhook(tenantId, tipoEvento, datos) {
  try {
    // Obtener configuración del negocio
    const negocio = getOne(
      `SELECT tenant_id, nombre_negocio, email, telefono, direccion, config
       FROM negocios WHERE tenant_id = ?`,
      [tenantId]
    );

    if (!negocio) {
      console.error(`❌ Negocio no encontrado: ${tenantId}`);
      return false;
    }

    // Parsear configuración
    const config = negocio.config ? JSON.parse(negocio.config) : {};

    // Verificar si los webhooks están activos
    if (config.webhooks_activos === false) {
      console.log(`⏸️  Webhooks desactivados para tenant: ${tenantId}`);
      return false;
    }

    // WEBHOOK UNIFICADO: Usar la misma URL para TODO
    const webhookUrl = config.webhook_url || process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log(`⚠️  No hay webhook configurado para tenant: ${tenantId}`);
      return false;
    }

    // Preparar payload completo UNIFICADO
    const payload = {
      evento: tipoEvento, // Campo crítico para distinguir en n8n
      timestamp: new Date().toISOString(),
      negocio: {
        tenant_id: negocio.tenant_id,
        nombre: negocio.nombre_negocio,
        email: negocio.email,
        telefono: negocio.telefono,
        direccion: negocio.direccion,
      },
      datos: datos,
      metadata: {
        version: '1.0',
        origen: 'sistema_citas',
      },
    };

    // Enviar webhook
    console.log(`🪝 Enviando webhook [${tipoEvento}] a: ${webhookUrl}`);

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'X-Event-Type': tipoEvento,
      },
      timeout: 10000, // 10 segundos
    });

    console.log(`✅ Webhook enviado exitosamente [${tipoEvento}]`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar webhook [${tipoEvento}]:`, error.message);
    return false;
  }
}

/**
 * Envía webhook para evento de cita creada
 */
export async function webhookCitaCreada(tenantId, cita) {
  return enviarWebhook(tenantId, EVENTOS_WEBHOOK.CITA_CREADA, {
    cita_id: cita.cita_id,
    cliente: {
      id: cita.cliente_id,
      nombre: cita.cliente_nombre,
      telefono: cita.cliente_telefono,
      email: cita.cliente_email,
    },
    servicio: {
      id: cita.servicio_id,
      nombre: cita.servicio_nombre,
      precio: cita.precio_servicio,
      duracion: cita.servicio_duracion,
    },
    fecha: cita.fecha,
    hora_inicio: cita.hora_inicio,
    hora_fin: cita.hora_fin,
    estado: cita.estado,
    notas: cita.notas,
    created_by: cita.created_by,
  });
}

/**
 * Envía webhook para evento de cita actualizada
 */
export async function webhookCitaActualizada(tenantId, cita, cambios) {
  return enviarWebhook(tenantId, EVENTOS_WEBHOOK.CITA_ACTUALIZADA, {
    cita_id: cita.cita_id,
    cliente: {
      nombre: cita.cliente_nombre,
      telefono: cita.cliente_telefono,
    },
    servicio: {
      nombre: cita.servicio_nombre,
    },
    fecha: cita.fecha,
    hora_inicio: cita.hora_inicio,
    hora_fin: cita.hora_fin,
    estado: cita.estado,
    notas: cita.notas,
    cambios: cambios, // Array de campos que cambiaron
  });
}

/**
 * Envía webhook para evento de cita cancelada
 */
export async function webhookCitaCancelada(tenantId, cita, motivo) {
  return enviarWebhook(tenantId, EVENTOS_WEBHOOK.CITA_CANCELADA, {
    cita_id: cita.cita_id,
    cliente: {
      nombre: cita.cliente_nombre,
      telefono: cita.cliente_telefono,
      email: cita.cliente_email,
    },
    servicio: {
      nombre: cita.servicio_nombre,
      precio: cita.precio_servicio,
    },
    fecha: cita.fecha,
    hora_inicio: cita.hora_inicio,
    hora_fin: cita.hora_fin,
    motivo: motivo,
    cancelada_en: new Date().toISOString(),
  });
}

/**
 * Envía webhook para evento de cita confirmada
 */
export async function webhookCitaConfirmada(tenantId, cita) {
  return enviarWebhook(tenantId, EVENTOS_WEBHOOK.CITA_CONFIRMADA, {
    cita_id: cita.cita_id,
    cliente: {
      nombre: cita.cliente_nombre,
      telefono: cita.cliente_telefono,
    },
    servicio: {
      nombre: cita.servicio_nombre,
    },
    fecha: cita.fecha,
    hora_inicio: cita.hora_inicio,
    confirmada_en: new Date().toISOString(),
  });
}

/**
 * Envía webhook para evento de cita completada
 */
export async function webhookCitaCompletada(tenantId, cita) {
  return enviarWebhook(tenantId, EVENTOS_WEBHOOK.CITA_COMPLETADA, {
    cita_id: cita.cita_id,
    cliente: {
      nombre: cita.cliente_nombre,
      telefono: cita.cliente_telefono,
    },
    servicio: {
      nombre: cita.servicio_nombre,
      precio: cita.precio_servicio,
    },
    fecha: cita.fecha,
    hora_inicio: cita.hora_inicio,
    hora_fin: cita.hora_fin,
    completada_en: new Date().toISOString(),
  });
}

/**
 * Envía webhook para recordatorio
 * USA EL MISMO WEBHOOK UNIFICADO
 */
export async function webhookRecordatorio(tenantId, cita, negocio) {
  const config = negocio.config ? JSON.parse(negocio.config) : {};

  return enviarWebhook(tenantId, EVENTOS_WEBHOOK.RECORDATORIO_ENVIADO, {
    cita: {
      cita_id: cita.cita_id,
      fecha: cita.fecha,
      hora: cita.hora_inicio,
      servicio: cita.servicio_nombre,
    },
    cliente: {
      nombre: cita.cliente_nombre,
      telefono: cita.cliente_telefono,
      email: cita.cliente_email,
    },
    config: {
      enviar_confirmacion: config.enviar_confirmacion_automatica !== false,
      permitir_cancelacion: config.permitir_cancelacion_cliente !== false,
    },
  });
}
