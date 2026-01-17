import jwt from 'jsonwebtoken';
import { getOne } from '../database/db.js';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const verifyTenant = (req, res, next) => {
  // Debugging: log all headers
  console.log('🔍 All headers:', Object.keys(req.headers));
  console.log('🔍 Looking for tenant_id in:', {
    header: req.headers['x-tenant-id'],
    body: req.body?.tenant_id,
    query: req.query?.tenant_id,
  });

  const tenantId = req.headers['x-tenant-id'] || req.body.tenant_id || req.query.tenant_id;

  if (!tenantId) {
    console.error('❌ Tenant ID no proporcionado');
    return res.status(400).json({ error: 'Tenant ID no proporcionado' });
  }

  // Verificar que el tenant existe
  const tenant = getOne('SELECT tenant_id FROM negocios WHERE tenant_id = ?', [tenantId]);

  if (!tenant) {
    console.error('❌ Negocio no encontrado para tenant_id:', tenantId);
    return res.status(404).json({ error: 'Negocio no encontrado' });
  }

  console.log('✅ Tenant verificado:', tenantId);
  req.tenantId = tenantId;
  next();
};

export const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key no proporcionada' });
  }

  // Verificar que el API key es válido y obtener el tenant_id
  const tenant = getOne('SELECT tenant_id FROM negocios WHERE api_key = ?', [apiKey]);

  if (!tenant) {
    return res.status(401).json({ error: 'API Key inválida' });
  }

  req.tenantId = tenant.tenant_id;
  next();
};
