import { format, parse, addMinutes, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha a formato legible
 * @param {Date|string} date - Fecha a formatear
 * @param {string} formatStr - Formato deseado
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: es });
};

/**
 * Formatea una hora a formato HH:mm
 * @param {Date|string} time - Hora a formatear
 * @returns {string} Hora formateada
 */
export const formatTime = (time) => {
  if (!time) return '';

  // Si ya es string en formato HH:mm, devolverlo directamente
  if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  // Si es Date object, formatearlo
  const timeObj = typeof time === 'string' ? parseISO(time) : time;
  return format(timeObj, 'HH:mm');
};

/**
 * Formatea una fecha completa con hora
 * @param {Date|string} datetime - Fecha y hora
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  const datetimeObj = typeof datetime === 'string' ? parseISO(datetime) : datetime;
  return format(datetimeObj, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
};

/**
 * Combina fecha y hora en un objeto Date
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @param {string} timeStr - Hora en formato HH:mm
 * @returns {Date} Objeto Date combinado
 */
export const combineDateAndTime = (dateStr, timeStr) => {
  const date = parseISO(dateStr);
  const [hours, minutes] = timeStr.split(':');
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
};

/**
 * Calcula la hora de fin basándose en la hora de inicio y duración
 * @param {string} startTime - Hora de inicio (HH:mm)
 * @param {number} duration - Duración en minutos
 * @returns {string} Hora de fin (HH:mm)
 */
export const calculateEndTime = (startTime, duration) => {
  const [hours, minutes] = startTime.split(':');
  const startDate = new Date();
  startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  const endDate = addMinutes(startDate, duration);
  return format(endDate, 'HH:mm');
};

/**
 * Verifica si una hora está dentro de un rango
 * @param {string} time - Hora a verificar (HH:mm)
 * @param {string} start - Hora de inicio del rango (HH:mm)
 * @param {string} end - Hora de fin del rango (HH:mm)
 * @returns {boolean} True si está dentro del rango
 */
export const isTimeInRange = (time, start, end) => {
  const timeDate = parse(time, 'HH:mm', new Date());
  const startDate = parse(start, 'HH:mm', new Date());
  const endDate = parse(end, 'HH:mm', new Date());

  return (isAfter(timeDate, startDate) || isEqual(timeDate, startDate)) &&
         (isBefore(timeDate, endDate) || isEqual(timeDate, endDate));
};

/**
 * Genera slots de tiempo disponibles
 * @param {string} startTime - Hora de inicio (HH:mm)
 * @param {string} endTime - Hora de fin (HH:mm)
 * @param {number} interval - Intervalo en minutos
 * @returns {Array<string>} Array de horas disponibles
 */
export const generateTimeSlots = (startTime, endTime, interval = 30) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentDate = new Date();
  currentDate.setHours(startHour, startMinute, 0, 0);

  const endDate = new Date();
  endDate.setHours(endHour, endMinute, 0, 0);

  while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
    slots.push(format(currentDate, 'HH:mm'));
    currentDate = addMinutes(currentDate, interval);
  }

  return slots;
};

/**
 * Obtiene el día de la semana en español
 * @param {Date|string} date - Fecha
 * @returns {string} Día de la semana
 */
export const getDayOfWeek = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEEE', { locale: es });
};

/**
 * Verifica si una fecha es hoy
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} True si es hoy
 */
export const isToday = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
};

/**
 * Verifica si una fecha es mañana
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} True si es mañana
 */
export const isTomorrow = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return format(dateObj, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd');
};
