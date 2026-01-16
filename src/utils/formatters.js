/**
 * Formatea un número como precio en euros
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Precio formateado
 */
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined) return '0,00 €';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

/**
 * Formatea un número de teléfono
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Elimina espacios y caracteres especiales
  const cleaned = phone.replace(/\D/g, '');

  // Formato español: +34 XXX XX XX XX
  if (cleaned.startsWith('34') && cleaned.length === 11) {
    return `+34 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }

  // Formato local: XXX XX XX XX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
};

/**
 * Formatea la duración en minutos a texto legible
 * @param {number} minutes - Duración en minutos
 * @returns {string} Duración formateada
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
};

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Trunca un texto a un número máximo de caracteres
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales
 */
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Obtiene el color según el estado de la cita
 * @param {string} status - Estado de la cita
 * @returns {string} Clase CSS de color
 */
export const getStatusColor = (status) => {
  const colors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-green-100 text-green-800',
    completada: 'bg-gray-100 text-gray-800',
    cancelada: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Obtiene el texto en español del estado
 * @param {string} status - Estado de la cita
 * @returns {string} Texto del estado
 */
export const getStatusText = (status) => {
  const texts = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    completada: 'Completada',
    cancelada: 'Cancelada',
    no_show: 'No Show',
  };
  return texts[status] || status;
};
