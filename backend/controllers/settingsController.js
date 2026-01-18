import { getOne, run } from '../database/db.js';

// Obtener configuración del negocio
export const obtenerConfiguracion = (req, res) => {
  try {
    const tenantId = req.tenantId;

    const negocio = getOne(
      `SELECT
        tenant_id,
        nombre_negocio,
        tipo_negocio,
        direccion,
        telefono,
        logo_url,
        horario,
        config
       FROM negocios
       WHERE tenant_id = ?`,
      [tenantId]
    );

    if (!negocio) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    // Parsear JSON de horario y config
    const configuracion = {
      ...negocio,
      horario: negocio.horario ? JSON.parse(negocio.horario) : null,
      config: negocio.config ? JSON.parse(negocio.config) : {}
    };

    res.json(configuracion);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
};

// Actualizar configuración del negocio
export const actualizarConfiguracion = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const {
      nombre_negocio,
      tipo_negocio,
      direccion,
      telefono,
      logo_url,
      horario,
      webhook_url,
      reminder_hours_before,
      // Otros campos de configuración
      ...otrosConfig
    } = req.body;

    // Obtener configuración actual
    const negocioActual = getOne(
      'SELECT config FROM negocios WHERE tenant_id = ?',
      [tenantId]
    );

    if (!negocioActual) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    // Parsear config actual y mergear con nuevos valores
    const configActual = negocioActual.config ? JSON.parse(negocioActual.config) : {};
    const nuevaConfig = {
      ...configActual,
      webhook_url: webhook_url !== undefined ? webhook_url : configActual.webhook_url,
      reminder_hours_before: reminder_hours_before !== undefined ? reminder_hours_before : configActual.reminder_hours_before,
      ...otrosConfig
    };

    // Construir query de actualización
    const updates = [];
    const params = [];

    if (nombre_negocio !== undefined) {
      updates.push('nombre_negocio = ?');
      params.push(nombre_negocio);
    }

    if (tipo_negocio !== undefined) {
      updates.push('tipo_negocio = ?');
      params.push(tipo_negocio);
    }

    if (direccion !== undefined) {
      updates.push('direccion = ?');
      params.push(direccion);
    }

    if (telefono !== undefined) {
      updates.push('telefono = ?');
      params.push(telefono);
    }

    if (logo_url !== undefined) {
      updates.push('logo_url = ?');
      params.push(logo_url);
    }

    if (horario !== undefined) {
      updates.push('horario = ?');
      params.push(JSON.stringify(horario));
    }

    // Siempre actualizar config y updated_at
    updates.push('config = ?');
    params.push(JSON.stringify(nuevaConfig));

    updates.push('updated_at = CURRENT_TIMESTAMP');

    // Añadir tenant_id al final
    params.push(tenantId);

    const query = `
      UPDATE negocios
      SET ${updates.join(', ')}
      WHERE tenant_id = ?
    `;

    run(query, params);

    // Devolver configuración actualizada
    const negocioActualizado = getOne(
      `SELECT
        tenant_id,
        nombre_negocio,
        tipo_negocio,
        direccion,
        telefono,
        logo_url,
        horario,
        config
       FROM negocios
       WHERE tenant_id = ?`,
      [tenantId]
    );

    const configuracion = {
      ...negocioActualizado,
      horario: negocioActualizado.horario ? JSON.parse(negocioActualizado.horario) : null,
      config: negocioActualizado.config ? JSON.parse(negocioActualizado.config) : {}
    };

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      configuracion
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
};

// Actualizar solo webhook URL (simplificado para n8n)
export const actualizarWebhookUrl = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { webhook_url } = req.body;

    if (!webhook_url) {
      return res.status(400).json({ error: 'webhook_url es obligatorio' });
    }

    // Obtener config actual
    const negocio = getOne(
      'SELECT config FROM negocios WHERE tenant_id = ?',
      [tenantId]
    );

    if (!negocio) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    // Actualizar solo webhook_url en config
    const config = negocio.config ? JSON.parse(negocio.config) : {};
    config.webhook_url = webhook_url;

    run(
      'UPDATE negocios SET config = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ?',
      [JSON.stringify(config), tenantId]
    );

    res.json({
      success: true,
      message: 'Webhook URL actualizado exitosamente',
      webhook_url
    });
  } catch (error) {
    console.error('Error al actualizar webhook URL:', error);
    res.status(500).json({ error: 'Error al actualizar webhook URL' });
  }
};
