import { v4 as uuidv4 } from 'uuid';
import { getOne, getAll, run } from '../database/db.js';
import { webhookCitaCreada, webhookCitaActualizada, webhookCitaCancelada, webhookCitaConfirmada, webhookCitaCompletada } from '../utils/webhooks.js';

// Crear cita
export const crearCita = (req, res) => {
  try {
    const {
      cliente_id,
      cliente_nombre,
      cliente_telefono,
      cliente_email,
      servicio_id,
      fecha,
      hora,
      notas,
      created_by = 'manual',
    } = req.body;

    const tenantId = req.tenantId;

    // Validaciones
    if (!servicio_id || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: servicio_id, fecha, hora' });
    }

    // UPSERT de cliente: buscar por teléfono o crear nuevo
    let finalClienteId = cliente_id;

    if (!cliente_id) {
      // Si no hay cliente_id, necesitamos al menos nombre y teléfono
      if (!cliente_nombre || !cliente_telefono) {
        return res.status(400).json({
          error: 'Debe proporcionar cliente_id O (cliente_nombre + cliente_telefono)'
        });
      }

      // Buscar cliente existente por teléfono
      const clienteExistente = getOne(
        `SELECT cliente_id FROM clientes WHERE tenant_id = ? AND telefono = ?`,
        [tenantId, cliente_telefono]
      );

      if (clienteExistente) {
        // Cliente ya existe, usar su ID
        finalClienteId = clienteExistente.cliente_id;
        console.log(`✅ Cliente encontrado por teléfono: ${finalClienteId}`);
      } else {
        // Crear cliente nuevo
        finalClienteId = uuidv4();
        run(
          `INSERT INTO clientes (cliente_id, tenant_id, nombre, telefono, email)
           VALUES (?, ?, ?, ?, ?)`,
          [finalClienteId, tenantId, cliente_nombre, cliente_telefono, cliente_email || null]
        );
        console.log(`✅ Cliente nuevo creado: ${finalClienteId}`);
      }
    }

    // Obtener duración del servicio
    const servicio = getOne(
      `SELECT duracion, precio FROM servicios WHERE servicio_id = ? AND tenant_id = ?`,
      [servicio_id, tenantId]
    );

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Calcular hora de fin
    const [horaNum, minNum] = hora.split(':').map(Number);
    const horaFin = new Date();
    horaFin.setHours(horaNum, minNum + servicio.duracion);
    const horaFinStr = `${String(horaFin.getHours()).padStart(2, '0')}:${String(horaFin.getMinutes()).padStart(2, '0')}`;

    // Verificar disponibilidad (que no haya otra cita en ese horario)
    const conflicto = getOne(
      `SELECT cita_id FROM citas
       WHERE tenant_id = ?
       AND fecha = ?
       AND estado NOT IN ('cancelada', 'completada')
       AND (
         (hora_inicio < ? AND hora_fin > ?) OR
         (hora_inicio >= ? AND hora_inicio < ?)
       )`,
      [tenantId, fecha, horaFinStr, hora, hora, horaFinStr]
    );

    if (conflicto) {
      return res.status(409).json({
        error: 'Ya existe una cita en este horario',
        available: false
      });
    }

    // Crear cita
    const citaId = uuidv4();
    run(
      `INSERT INTO citas (
        cita_id, tenant_id, cliente_id, servicio_id, fecha, hora_inicio, hora_fin, notas, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [citaId, tenantId, finalClienteId, servicio_id, fecha, hora, horaFinStr, notas, created_by]
    );

    // Obtener la cita completa con datos relacionados
    const citaCompleta = getOne(
      `SELECT
        c.*,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        s.nombre as servicio_nombre,
        s.duracion as servicio_duracion,
        s.precio as precio_servicio
       FROM citas c
       JOIN clientes cl ON c.cliente_id = cl.cliente_id
       JOIN servicios s ON c.servicio_id = s.servicio_id
       WHERE c.cita_id = ?`,
      [citaId]
    );

    // Enviar webhook de cita creada (no esperar respuesta)
    webhookCitaCreada(tenantId, citaCompleta).catch(err =>
      console.error('Error en webhook cita creada:', err)
    );

    res.status(201).json(citaCompleta);
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ error: 'Error al crear la cita' });
  }
};

// Función helper: Limpiar citas canceladas antiguas (>1 hora)
const limpiarCitasCanceladasAntiguas = (tenantId) => {
  try {
    // Borrar citas canceladas con más de 1 hora de antigüedad
    const query = `
      DELETE FROM citas
      WHERE tenant_id = ?
      AND estado = 'cancelada'
      AND datetime(updated_at, '+1 hour') < datetime('now')
    `;

    const result = run(query, [tenantId]);

    if (result && result.changes > 0) {
      console.log(`🗑️  Limpiadas ${result.changes} citas canceladas antiguas para tenant ${tenantId}`);
    }
  } catch (error) {
    console.error('Error limpiando citas canceladas:', error);
  }
};

// Listar citas
export const listarCitas = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { fecha_inicio, fecha_fin, cliente_id, estado } = req.query;

    // Limpiar citas canceladas antiguas antes de listar
    limpiarCitasCanceladasAntiguas(tenantId);

    let query = `
      SELECT
        c.*,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        s.nombre as servicio_nombre,
        s.duracion as servicio_duracion,
        s.precio as precio_servicio
      FROM citas c
      JOIN clientes cl ON c.cliente_id = cl.cliente_id
      JOIN servicios s ON c.servicio_id = s.servicio_id
      WHERE c.tenant_id = ?
    `;

    const params = [tenantId];

    if (fecha_inicio) {
      query += ' AND c.fecha >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND c.fecha <= ?';
      params.push(fecha_fin);
    }

    if (cliente_id) {
      query += ' AND c.cliente_id = ?';
      params.push(cliente_id);
    }

    if (estado) {
      query += ' AND c.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY c.fecha DESC, c.hora_inicio DESC';

    const citas = getAll(query, params);
    res.json(citas);
  } catch (error) {
    console.error('Error al listar citas:', error);
    res.status(500).json({ error: 'Error al listar las citas' });
  }
};

// Obtener una cita
export const obtenerCita = (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const cita = getOne(
      `SELECT
        c.*,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        s.nombre as servicio_nombre,
        s.precio as precio_servicio
       FROM citas c
       JOIN clientes cl ON c.cliente_id = cl.cliente_id
       JOIN servicios s ON c.servicio_id = s.servicio_id
       WHERE c.cita_id = ? AND c.tenant_id = ?`,
      [id, tenantId]
    );

    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json(cita);
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({ error: 'Error al obtener la cita' });
  }
};

// Actualizar cita
export const actualizarCita = (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const { estado, fecha, hora, notas, servicio_id } = req.body;

    // Verificar que la cita existe
    const citaExistente = getOne(
      'SELECT * FROM citas WHERE cita_id = ? AND tenant_id = ?',
      [id, tenantId]
    );

    if (!citaExistente) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    // Construir query de actualización dinámicamente
    const updates = [];
    const params = [];
    const cambios = []; // Para tracking de cambios

    if (estado) {
      updates.push('estado = ?');
      params.push(estado);
      if (citaExistente.estado !== estado) {
        cambios.push({ campo: 'estado', anterior: citaExistente.estado, nuevo: estado });
      }
    }

    if (fecha) {
      updates.push('fecha = ?');
      params.push(fecha);
      if (citaExistente.fecha !== fecha) {
        cambios.push({ campo: 'fecha', anterior: citaExistente.fecha, nuevo: fecha });
      }
    }

    if (hora) {
      updates.push('hora_inicio = ?');
      params.push(hora);
      if (citaExistente.hora_inicio !== hora) {
        cambios.push({ campo: 'hora', anterior: citaExistente.hora_inicio, nuevo: hora });
      }

      // Recalcular hora_fin si cambió la hora
      if (servicio_id || citaExistente.servicio_id) {
        const sid = servicio_id || citaExistente.servicio_id;
        const servicio = getOne('SELECT duracion FROM servicios WHERE servicio_id = ?', [sid]);

        if (servicio) {
          const [horaNum, minNum] = hora.split(':').map(Number);
          const horaFin = new Date();
          horaFin.setHours(horaNum, minNum + servicio.duracion);
          const horaFinStr = `${String(horaFin.getHours()).padStart(2, '0')}:${String(horaFin.getMinutes()).padStart(2, '0')}`;

          updates.push('hora_fin = ?');
          params.push(horaFinStr);
        }
      }
    }

    if (servicio_id) {
      updates.push('servicio_id = ?');
      params.push(servicio_id);
    }

    if (notas !== undefined) {
      updates.push('notas = ?');
      params.push(notas);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    params.push(id, tenantId);

    const query = `UPDATE citas SET ${updates.join(', ')} WHERE cita_id = ? AND tenant_id = ?`;
    run(query, params);

    // Obtener cita actualizada
    const citaActualizada = getOne(
      `SELECT
        c.*,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        s.nombre as servicio_nombre,
        s.precio as precio_servicio
       FROM citas c
       JOIN clientes cl ON c.cliente_id = cl.cliente_id
       JOIN servicios s ON c.servicio_id = s.servicio_id
       WHERE c.cita_id = ?`,
      [id]
    );

    // Enviar webhooks según el tipo de cambio
    if (estado === 'confirmada' && citaExistente.estado !== 'confirmada') {
      webhookCitaConfirmada(tenantId, citaActualizada).catch(err =>
        console.error('Error en webhook cita confirmada:', err)
      );
    } else if (estado === 'completada' && citaExistente.estado !== 'completada') {
      webhookCitaCompletada(tenantId, citaActualizada).catch(err =>
        console.error('Error en webhook cita completada:', err)
      );
    } else if (cambios.length > 0) {
      webhookCitaActualizada(tenantId, citaActualizada, cambios).catch(err =>
        console.error('Error en webhook cita actualizada:', err)
      );
    }

    res.json(citaActualizada);
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({ error: 'Error al actualizar la cita' });
  }
};

// Cancelar cita
export const cancelarCita = (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const { motivo } = req.body;

    // Obtener cita completa antes de cancelar
    const cita = getOne(
      `SELECT
        c.*,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        s.nombre as servicio_nombre,
        s.precio as precio_servicio
       FROM citas c
       JOIN clientes cl ON c.cliente_id = cl.cliente_id
       JOIN servicios s ON c.servicio_id = s.servicio_id
       WHERE c.cita_id = ? AND c.tenant_id = ?`,
      [id, tenantId]
    );

    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    run(
      'UPDATE citas SET estado = ?, notas = ?, updated_at = CURRENT_TIMESTAMP WHERE cita_id = ?',
      ['cancelada', motivo ? `CANCELADA: ${motivo}` : 'CANCELADA', id]
    );

    // Enviar webhook de cita cancelada
    webhookCitaCancelada(tenantId, cita, motivo).catch(err =>
      console.error('Error en webhook cita cancelada:', err)
    );

    res.json({ success: true, message: 'Cita cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({ error: 'Error al cancelar la cita' });
  }
};

// Cancelar cita por teléfono y fecha (sin necesitar cita_id)
export const cancelarCitaPorTelefono = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { telefono, fecha, hora, motivo } = req.body;

    if (!telefono || !fecha) {
      return res.status(400).json({
        error: 'Teléfono y fecha son obligatorios'
      });
    }

    // Buscar cita(s) del cliente en esa fecha
    let query = `
      SELECT
        c.*,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        s.nombre as servicio_nombre,
        s.precio as precio_servicio
       FROM citas c
       JOIN clientes cl ON c.cliente_id = cl.cliente_id
       JOIN servicios s ON c.servicio_id = s.servicio_id
       WHERE c.tenant_id = ?
       AND cl.telefono = ?
       AND c.fecha = ?
       AND c.estado NOT IN ('cancelada', 'completada')
    `;

    const params = [tenantId, telefono, fecha];

    // Si se proporciona hora, buscar cita específica
    if (hora) {
      query += ' AND c.hora_inicio = ?';
      params.push(hora);
    }

    query += ' LIMIT 1';

    const cita = getOne(query, params);

    if (!cita) {
      return res.status(404).json({
        error: 'No se encontró ninguna cita para ese teléfono y fecha'
      });
    }

    // Cancelar la cita
    run(
      'UPDATE citas SET estado = ?, notas = ?, updated_at = CURRENT_TIMESTAMP WHERE cita_id = ?',
      ['cancelada', motivo ? `CANCELADA: ${motivo}` : 'CANCELADA por teléfono', cita.cita_id]
    );

    // Enviar webhook de cita cancelada
    webhookCitaCancelada(tenantId, cita, motivo).catch(err =>
      console.error('Error en webhook cita cancelada:', err)
    );

    res.json({
      success: true,
      message: 'Cita cancelada exitosamente',
      cita_cancelada: {
        cliente: cita.cliente_nombre,
        servicio: cita.servicio_nombre,
        fecha: cita.fecha,
        hora: cita.hora_inicio
      }
    });
  } catch (error) {
    console.error('Error al cancelar cita por teléfono:', error);
    res.status(500).json({ error: 'Error al cancelar la cita' });
  }
};

// Consultar disponibilidad
export const consultarDisponibilidad = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: 'Fecha es obligatoria' });
    }

    // Obtener citas del día con información completa
    const citasDelDia = getAll(
      `SELECT c.hora_inicio, c.hora_fin, c.estado, s.nombre as servicio_nombre, cl.nombre as cliente_nombre
       FROM citas c
       JOIN servicios s ON c.servicio_id = s.servicio_id
       JOIN clientes cl ON c.cliente_id = cl.cliente_id
       WHERE c.tenant_id = ? AND c.fecha = ? AND c.estado NOT IN ('cancelada')
       ORDER BY c.hora_inicio`,
      [tenantId, fecha]
    );

    // Generar todos los slots del día (9:00 - 20:00 cada 30 min)
    const horaInicio = 9; // 9:00
    const horaFin = 20; // 20:00
    const intervalo = 30; // minutos
    const slots = [];

    for (let hora = horaInicio * 60; hora < horaFin * 60; hora += intervalo) {
      const horas = Math.floor(hora / 60);
      const minutos = hora % 60;
      const horaStr = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

      // Verificar si este slot está ocupado por alguna cita
      const citaEnSlot = citasDelDia.find((cita) => {
        return horaStr >= cita.hora_inicio && horaStr < cita.hora_fin;
      });

      if (citaEnSlot) {
        slots.push({
          hora: horaStr,
          disponible: false,
          ocupado_por: citaEnSlot.servicio_nombre,
          cliente: citaEnSlot.cliente_nombre,
          estado: citaEnSlot.estado
        });
      } else {
        slots.push({
          hora: horaStr,
          disponible: true
        });
      }
    }

    // Contar slots libres y ocupados
    const libres = slots.filter(s => s.disponible).length;
    const ocupados = slots.filter(s => !s.disponible).length;

    res.json({
      fecha,
      horario_negocio: {
        apertura: '09:00',
        cierre: '20:00',
        intervalo_minutos: intervalo
      },
      resumen: {
        total_slots: slots.length,
        libres,
        ocupados
      },
      slots,
      citas_del_dia: citasDelDia
    });
  } catch (error) {
    console.error('Error al consultar disponibilidad:', error);
    res.status(500).json({ error: 'Error al consultar disponibilidad' });
  }
};
