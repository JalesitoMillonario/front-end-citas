import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getOne, run } from '../database/db.js';
import crypto from 'crypto';

// Login con Google
export const loginGoogle = async (req, res) => {
  try {
    const { credential } = req.body;

    // En producción deberías verificar el token de Google aquí
    // Por ahora simulamos la decodificación
    // const ticket = await client.verifyIdToken({ idToken: credential });
    // const payload = ticket.getPayload();

    // Para desarrollo, extraemos info del credential (JWT de Google)
    const parts = credential.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ error: 'Token de Google inválido' });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const email = payload.email;
    const nombre = payload.name || email.split('@')[0];
    const foto = payload.picture;

    if (!email) {
      return res.status(400).json({ error: 'Email no encontrado en el token' });
    }

    // Buscar o crear negocio
    let negocio = getOne('SELECT * FROM negocios WHERE email = ?', [email]);

    if (!negocio) {
      // Crear nuevo negocio
      const tenantId = uuidv4();
      const apiKey = crypto.randomBytes(32).toString('hex');

      run(
        `INSERT INTO negocios (tenant_id, email, nombre_negocio, api_key)
         VALUES (?, ?, ?, ?)`,
        [tenantId, email, nombre, apiKey]
      );

      negocio = getOne('SELECT * FROM negocios WHERE tenant_id = ?', [tenantId]);
    }

    // Generar JWT
    const token = jwt.sign(
      {
        tenant_id: negocio.tenant_id,
        email: negocio.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      tenant_id: negocio.tenant_id,
      user: {
        nombre: negocio.nombre_negocio,
        email: negocio.email,
        foto,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al procesar el login' });
  }
};

// Obtener usuario actual
export const getCurrentUser = (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const negocio = getOne('SELECT * FROM negocios WHERE tenant_id = ?', [tenantId]);

    if (!negocio) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      nombre: negocio.nombre_negocio,
      email: negocio.email,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Obtener configuración del negocio
export const obtenerConfig = (req, res) => {
  try {
    const tenantId = req.tenantId;

    const negocio = getOne('SELECT * FROM negocios WHERE tenant_id = ?', [tenantId]);

    if (!negocio) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    // Parsear JSON fields
    console.log('📖 Config en DB (raw):', negocio.config);
    const config = negocio.config ? JSON.parse(negocio.config) : {};
    const horario = negocio.horario ? JSON.parse(negocio.horario) : {};
    console.log('📖 Config parseado:', JSON.stringify(config, null, 2));

    res.json({
      tenant_id: negocio.tenant_id,
      email: negocio.email,
      nombre_negocio: negocio.nombre_negocio,
      tipo_negocio: negocio.tipo_negocio,
      direccion: negocio.direccion,
      telefono: negocio.telefono,
      logo_url: negocio.logo_url,
      api_key: negocio.api_key,
      horario,
      config,
    });
  } catch (error) {
    console.error('❌ Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

// Actualizar configuración del negocio
export const actualizarConfig = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const {
      nombre_negocio,
      tipo_negocio,
      direccion,
      telefono,
      logo_url,
      config,
    } = req.body;

    console.log('📝 Actualizando config para tenant:', tenantId);
    console.log('📝 Config recibido:', JSON.stringify(config, null, 2));

    const updates = [];
    const params = [];

    if (nombre_negocio) { updates.push('nombre_negocio = ?'); params.push(nombre_negocio); }
    if (tipo_negocio) { updates.push('tipo_negocio = ?'); params.push(tipo_negocio); }
    if (direccion !== undefined) { updates.push('direccion = ?'); params.push(direccion); }
    if (telefono) { updates.push('telefono = ?'); params.push(telefono); }
    if (logo_url !== undefined) { updates.push('logo_url = ?'); params.push(logo_url); }
    if (config) { updates.push('config = ?'); params.push(JSON.stringify(config)); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(tenantId);

    const query = `UPDATE negocios SET ${updates.join(', ')} WHERE tenant_id = ?`;
    console.log('📝 SQL Query:', query);
    console.log('📝 SQL Params:', params);

    run(query, params);

    const negocio = getOne('SELECT * FROM negocios WHERE tenant_id = ?', [tenantId]);
    console.log('✅ Config guardado. Verificando en DB:', negocio?.config);

    res.json(negocio);
  } catch (error) {
    console.error('❌ Error al actualizar configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

// Actualizar horario
export const actualizarHorario = (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { horario } = req.body;

    if (!horario) {
      return res.status(400).json({ error: 'Horario es obligatorio' });
    }

    run(
      'UPDATE negocios SET horario = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ?',
      [JSON.stringify(horario), tenantId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar horario' });
  }
};
