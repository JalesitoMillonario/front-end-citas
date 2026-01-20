import { v4 as uuidv4 } from 'uuid';
import { getOne, getAll, run } from '../database/db.js';
import { webhookCitaCreada, webhookCitaActualizada, webhookCitaCancelada, webhookCitaConfirmada, webhookCitaCompletada } from '../utils/webhooks.js';

// Función auxiliar para validar horario de apertura
function validarHorarioApertura(tenantId, fecha, hora) {
  // Obtener horario del negocio
  const negocio = getOne(
    'SELECT horario FROM negocios WHERE tenant_id = ?',
    [tenantId]
  );

  if (!negocio || !negocio.horario) {
    return {
      valido: false,
      error: 'Negocio sin horario configurado'
    };
  }

  let horario;
  try {
    horario = JSON.parse(negocio.horario);
  } catch (e) {
    return {
      valido: false,
      error: 'Horario configurado inválido'
    };
  }

  // Obtener día de la semana
  const fechaObj = new Date(fecha + 'T00:00:00');
  const diaSemanaNumero = fechaObj.getDay();
  const diasMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diaSemana = diasMap[diaSemanaNumero];

  const horarioDia = horario[diaSemana];

  // Verificar si está cerrado
  if (!horarioDia || !horarioDia.abierto) {
    return {
      valido: false,
      error: `El negocio está cerrado los ${diaSemana}s`
    };
  }

  // Verificar si la hora está dentro del horario de apertura
  if (hora < horarioDia.inicio || hora >= horarioDia.cierre) {
    return {
      valido: false,
      error: `La hora debe estar entre ${horarioDia.inicio} y ${horarioDia.cierre}`
    };
  }

  // Verificar si está en pausa
  if (horarioDia.pausas && horarioDia.pausas.length > 0) {
    const enPausa = horarioDia.pausas.some(pausa => {
      return hora >= pausa.inicio && hora < pausa.fin;
    });

    if (enPausa) {
      return {
        valido: false,
        error: 'La hora seleccionada está en horario de pausa'
      };
    }
  }

  return { valido: true };
}

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

    // Validar que la cita esté dentro del horario de apertura
    const validacion = validarHorarioApertura(tenantId, fecha, hora);
    if (!validacion.valido) {
      return res.status(400).json({
        error: 'Horario no válido',
        message: validacion.error
      });
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

// Modificar cita por teléfono (cambiar fecha/hora sin necesitar cita_id)
export const modificarCitaPorTelefono = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { telefono, fecha_actual, hora_actual, nueva_fecha, nueva_hora, nuevo_servicio_id } = req.body;

    if (!telefono || !fecha_actual || !nueva_fecha || !nueva_hora) {
      return res.status(400).json({
        error: 'Teléfono, fecha_actual, nueva_fecha y nueva_hora son obligatorios'
      });
    }

    // Buscar la cita actual
    let query = `
      SELECT
        c.*,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        s.nombre as servicio_nombre,
        s.precio as precio_servicio,
        s.duracion_minutos as duracion_minutos
       FROM citas c
       JOIN clientes cl ON c.cliente_id = cl.cliente_id
       JOIN servicios s ON c.servicio_id = s.servicio_id
       WHERE c.tenant_id = ?
       AND cl.telefono = ?
       AND c.fecha = ?
       AND c.estado NOT IN ('cancelada', 'completada')
    `;

    const params = [tenantId, telefono, fecha_actual];

    // Si se proporciona hora_actual, buscar cita específica
    if (hora_actual) {
      query += ' AND c.hora_inicio = ?';
      params.push(hora_actual);
    }

    query += ' LIMIT 1';

    const citaActual = getOne(query, params);

    if (!citaActual) {
      return res.status(404).json({
        error: 'No se encontró ninguna cita para ese teléfono y fecha'
      });
    }

    // Validar que la nueva cita esté dentro del horario de apertura
    const validacion = validarHorarioApertura(tenantId, nueva_fecha, nueva_hora);
    if (!validacion.valido) {
      return res.status(400).json({
        error: 'Horario no válido',
        message: validacion.error
      });
    }

    // Determinar el servicio a usar (el nuevo o el actual)
    const servicioIdFinal = nuevo_servicio_id || citaActual.servicio_id;

    // Obtener duración del servicio
    const servicio = getOne(
      'SELECT duracion_minutos, nombre FROM servicios WHERE servicio_id = ? AND tenant_id = ?',
      [servicioIdFinal, tenantId]
    );

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Calcular hora_fin basada en duración
    const [nuevaHora, nuevosMinutos] = nueva_hora.split(':').map(Number);
    const minutosInicio = nuevaHora * 60 + nuevosMinutos;
    const minutosFin = minutosInicio + servicio.duracion_minutos;
    const horaFin = Math.floor(minutosFin / 60);
    const minutosFin2 = minutosFin % 60;
    const nuevaHoraFin = `${String(horaFin).padStart(2, '0')}:${String(minutosFin2).padStart(2, '0')}`;

    // Verificar disponibilidad en el nuevo horario (excluyendo la cita actual)
    const conflicto = getOne(
      `SELECT cita_id FROM citas
       WHERE tenant_id = ?
       AND fecha = ?
       AND cita_id != ?
       AND estado NOT IN ('cancelada', 'completada')
       AND (
         (hora_inicio < ? AND hora_fin > ?) OR
         (hora_inicio < ? AND hora_fin > ?) OR
         (hora_inicio >= ? AND hora_fin <= ?)
       )`,
      [tenantId, nueva_fecha, citaActual.cita_id, nuevaHoraFin, nueva_hora, nuevaHoraFin, nueva_hora, nueva_hora, nuevaHoraFin]
    );

    if (conflicto) {
      return res.status(409).json({
        error: 'El nuevo horario no está disponible, hay otra cita reservada'
      });
    }

    // Actualizar la cita
    run(
      `UPDATE citas
       SET fecha = ?, hora_inicio = ?, hora_fin = ?, servicio_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE cita_id = ?`,
      [nueva_fecha, nueva_hora, nuevaHoraFin, servicioIdFinal, citaActual.cita_id]
    );

    // Obtener la cita actualizada
    const citaActualizada = getOne(
      `SELECT
        c.*,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        s.nombre as servicio_nombre,
        s.precio as precio_servicio
       FROM citas c
       JOIN clientes cl ON c.cliente_id = cl.cliente_id
       JOIN servicios s ON c.servicio_id = s.servicio_id
       WHERE c.cita_id = ?`,
      [citaActual.cita_id]
    );

    // Enviar webhook de cita modificada
    webhookCitaActualizada(tenantId, citaActualizada).catch(err =>
      console.error('Error en webhook cita modificada:', err)
    );

    res.json({
      success: true,
      message: 'Cita modificada exitosamente',
      cita_anterior: {
        fecha: citaActual.fecha,
        hora: citaActual.hora_inicio,
        servicio: citaActual.servicio_nombre
      },
      cita_nueva: {
        cliente: citaActualizada.cliente_nombre,
        servicio: citaActualizada.servicio_nombre,
        fecha: citaActualizada.fecha,
        hora: citaActualizada.hora_inicio,
        precio: citaActualizada.precio_servicio
      }
    });
  } catch (error) {
    console.error('Error al modificar cita por teléfono:', error);
    res.status(500).json({ error: 'Error al modificar la cita' });
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

    // Obtener horario del negocio
    const negocio = getOne(
      'SELECT horario FROM negocios WHERE tenant_id = ?',
      [tenantId]
    );

    if (!negocio || !negocio.horario) {
      return res.status(400).json({
        error: 'Negocio no encontrado o sin horario configurado',
        message: 'Por favor configure el horario de su negocio en Configuración'
      });
    }

    let horario;
    try {
      horario = JSON.parse(negocio.horario);
    } catch (e) {
      return res.status(400).json({
        error: 'Horario configurado inválido',
        message: 'Por favor verifique la configuración del horario'
      });
    }

    // Obtener día de la semana de la fecha (0=domingo, 1=lunes, ..., 6=sábado)
    const fechaObj = new Date(fecha + 'T00:00:00');
    const diaSemanaNumero = fechaObj.getDay(); // 0=domingo, 1=lunes, etc.

    // Mapear número de día a nombre en español
    const diasMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemana = diasMap[diaSemanaNumero];

    const horarioDia = horario[diaSemana];

    // Verificar si el negocio está cerrado ese día
    if (!horarioDia || !horarioDia.abierto) {
      return res.json({
        fecha,
        dia_semana: diaSemana,
        cerrado: true,
        mensaje: `El negocio está cerrado los ${diaSemana}s`,
        horario_negocio: null,
        resumen: {
          total_slots: 0,
          libres: 0,
          ocupados: 0
        },
        slots: [],
        citas_del_dia: []
      });
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

    // Parsear horario de apertura y cierre
    const [horaApertura, minApertura] = horarioDia.inicio.split(':').map(Number);
    const [horaCierre, minCierre] = horarioDia.fin.split(':').map(Number);
    const horaInicioMinutos = horaApertura * 60 + minApertura;
    const horaFinMinutos = horaCierre * 60 + minCierre;

    const intervalo = 30; // minutos
    const slots = [];

    // Generar slots para el horario de apertura
    for (let minuto = horaInicioMinutos; minuto < horaFinMinutos; minuto += intervalo) {
      const horas = Math.floor(minuto / 60);
      const minutos = minuto % 60;
      const horaStr = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

      // Verificar si está en pausa
      let enPausa = false;
      if (horarioDia.pausas && horarioDia.pausas.length > 0) {
        enPausa = horarioDia.pausas.some(pausa => {
          return horaStr >= pausa.inicio && horaStr < pausa.fin;
        });
      }

      if (enPausa) {
        slots.push({
          hora: horaStr,
          disponible: false,
          motivo: 'pausa',
          ocupado_por: 'Pausa / Descanso'
        });
        continue;
      }

      // Verificar si este slot está ocupado por alguna cita
      const citaEnSlot = citasDelDia.find((cita) => {
        return horaStr >= cita.hora_inicio && horaStr < cita.hora_fin;
      });

      if (citaEnSlot) {
        slots.push({
          hora: horaStr,
          disponible: false,
          motivo: 'cita',
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
    const enPausa = slots.filter(s => s.motivo === 'pausa').length;

    res.json({
      fecha,
      dia_semana: diaSemana,
      cerrado: false,
      horario_negocio: {
        apertura: horarioDia.inicio,
        cierre: horarioDia.fin,
        pausas: horarioDia.pausas || [],
        intervalo_minutos: intervalo
      },
      resumen: {
        total_slots: slots.length,
        libres,
        ocupados: ocupados - enPausa,
        en_pausa: enPausa
      },
      slots,
      citas_del_dia: citasDelDia
    });
  } catch (error) {
    console.error('Error al consultar disponibilidad:', error);
    res.status(500).json({ error: 'Error al consultar disponibilidad' });
  }
};
