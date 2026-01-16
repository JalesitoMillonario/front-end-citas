import { v4 as uuidv4 } from 'uuid';
import { getOne, getAll, run } from '../database/db.js';

export const listarClientes = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const clientes = getAll(
      `SELECT c.*, COUNT(ci.cita_id) as total_citas
       FROM clientes c
       LEFT JOIN citas ci ON c.cliente_id = ci.cliente_id
       WHERE c.tenant_id = ?
       GROUP BY c.cliente_id
       ORDER BY c.nombre`,
      [tenantId]
    );
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar clientes' });
  }
};

export const crearCliente = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { nombre, telefono, email, notas } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });
    }

    const clienteId = uuidv4();
    run(
      `INSERT INTO clientes (cliente_id, tenant_id, nombre, telefono, email, notas)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clienteId, tenantId, nombre, telefono, email, notas]
    );

    const cliente = getOne('SELECT * FROM clientes WHERE cliente_id = ?', [clienteId]);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

export const buscarCliente = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { telefono, email } = req.query;

    let query = 'SELECT * FROM clientes WHERE tenant_id = ?';
    const params = [tenantId];

    if (telefono) {
      query += ' AND telefono = ?';
      params.push(telefono);
    } else if (email) {
      query += ' AND email = ?';
      params.push(email);
    } else {
      return res.status(400).json({ error: 'Debe proporcionar teléfono o email' });
    }

    const cliente = getOne(query, params);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar cliente' });
  }
};

export const actualizarCliente = (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const { nombre, telefono, email, notas } = req.body;

    const updates = [];
    const params = [];

    if (nombre) { updates.push('nombre = ?'); params.push(nombre); }
    if (telefono) { updates.push('telefono = ?'); params.push(telefono); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email); }
    if (notas !== undefined) { updates.push('notas = ?'); params.push(notas); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id, tenantId);

    run(
      `UPDATE clientes SET ${updates.join(', ')} WHERE cliente_id = ? AND tenant_id = ?`,
      params
    );

    const cliente = getOne('SELECT * FROM clientes WHERE cliente_id = ?', [id]);
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};
