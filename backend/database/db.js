import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'citas.db'));

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Función helper para obtener un registro
export const getOne = (query, params = []) => {
  return db.prepare(query).get(...params);
};

// Función helper para obtener múltiples registros
export const getAll = (query, params = []) => {
  return db.prepare(query).all(...params);
};

// Función helper para ejecutar insert/update/delete
export const run = (query, params = []) => {
  return db.prepare(query).run(...params);
};

// Función helper para transacciones
export const transaction = (fn) => {
  return db.transaction(fn);
};

export default db;
