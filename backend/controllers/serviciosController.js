import { v4 as uuidv4 } from 'uuid';
import { getOne, getAll, run } from '../database/db.js';

export const listarServicios = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const servicios = getAll(
      'SELECT * FROM servicios WHERE tenant_id = ? ORDER BY nombre',
      [tenantId]
    );
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar servicios' });
  }
};

export const crearServicio = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { nombre, descripcion, duracion, precio, categoria, activo = true } = req.body;

    if (!nombre || !duracion || precio === undefined) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const servicioId = uuidv4();
    run(
      `INSERT INTO servicios (servicio_id, tenant_id, nombre, descripcion, duracion, precio, categoria, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [servicioId, tenantId, nombre, descripcion, duracion, precio, categoria, activo ? 1 : 0]
    );

    const servicio = getOne('SELECT * FROM servicios WHERE servicio_id = ?', [servicioId]);
    res.status(201).json(servicio);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear servicio' });
  }
};

export const actualizarServicio = (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const { nombre, descripcion, duracion, precio, categoria, activo } = req.body;

    const updates = [];
    const params = [];

    if (nombre) { updates.push('nombre = ?'); params.push(nombre); }
    if (descripcion !== undefined) { updates.push('descripcion = ?'); params.push(descripcion); }
    if (duracion) { updates.push('duracion = ?'); params.push(duracion); }
    if (precio !== undefined) { updates.push('precio = ?'); params.push(precio); }
    if (categoria !== undefined) { updates.push('categoria = ?'); params.push(categoria); }
    if (activo !== undefined) { updates.push('activo = ?'); params.push(activo ? 1 : 0); }

    params.push(id, tenantId);

    run(
      `UPDATE servicios SET ${updates.join(', ')} WHERE servicio_id = ? AND tenant_id = ?`,
      params
    );

    const servicio = getOne('SELECT * FROM servicios WHERE servicio_id = ?', [id]);
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar servicio' });
  }
};

export const eliminarServicio = (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    run('DELETE FROM servicios WHERE servicio_id = ? AND tenant_id = ?', [id, tenantId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar servicio' });
  }
};
