import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getStatusColor } from '../../utils/formatters';

moment.locale('es');
const localizer = momentLocalizer(moment);

const AppointmentCalendar = ({ appointments = [], onSelectEvent, onSelectSlot, onEventDrop, schedule = null }) => {
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());

  // Convertir citas a eventos del calendario
  const events = useMemo(() => {
    return appointments.map((apt) => {
      const start = moment(`${apt.fecha} ${apt.hora_inicio}`, 'YYYY-MM-DD HH:mm').toDate();
      const end = moment(`${apt.fecha} ${apt.hora_fin}`, 'YYYY-MM-DD HH:mm').toDate();

      return {
        id: apt.cita_id,
        title: `${apt.cliente_nombre} - ${apt.servicio_nombre}`,
        start,
        end,
        resource: apt,
      };
    });
  }, [appointments]);

  // Función para verificar si un día está abierto
  const isDayOpen = useCallback((date) => {
    if (!schedule) return true; // Si no hay horario configurado, mostrar todo

    const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dayName = dayNames[date.getDay()];
    const daySchedule = schedule[dayName];

    return daySchedule && daySchedule.abierto;
  }, [schedule]);

  // Función para verificar si un slot está en horario de apertura
  const isSlotAvailable = useCallback((date) => {
    if (!schedule) return true;

    const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dayName = dayNames[date.getDay()];
    const daySchedule = schedule[dayName];

    if (!daySchedule || !daySchedule.abierto) return false;

    const slotTime = moment(date).format('HH:mm');
    const isInOpenHours = slotTime >= daySchedule.inicio && slotTime < daySchedule.cierre;

    if (!isInOpenHours) return false;

    // Verificar si está en pausa
    if (daySchedule.pausas && daySchedule.pausas.length > 0) {
      const isInPause = daySchedule.pausas.some(pausa => {
        return slotTime >= pausa.inicio && slotTime < pausa.fin;
      });
      if (isInPause) return false;
    }

    return true;
  }, [schedule]);

  // Estilizar días cerrados
  const dayPropGetter = useCallback((date) => {
    if (!isDayOpen(date)) {
      return {
        className: 'rbc-off-range-bg',
        style: {
          backgroundColor: '#f3f4f6',
          cursor: 'not-allowed',
        }
      };
    }
    return {};
  }, [isDayOpen]);

  // Estilizar slots fuera del horario
  const slotPropGetter = useCallback((date) => {
    if (!isSlotAvailable(date)) {
      return {
        style: {
          backgroundColor: '#f9fafb',
          cursor: 'not-allowed',
          opacity: 0.5,
        }
      };
    }
    return {};
  }, [isSlotAvailable]);

  // Calcular horarios mínimos y máximos basados en el horario del negocio
  const { minTime, maxTime } = useMemo(() => {
    if (!schedule) {
      return {
        minTime: new Date(2024, 1, 1, 8, 0, 0),
        maxTime: new Date(2024, 1, 1, 21, 0, 0),
      };
    }

    // Encontrar el horario más temprano y más tardío de todos los días
    let earliestHour = 24;
    let latestHour = 0;

    Object.values(schedule).forEach(daySchedule => {
      if (daySchedule.abierto) {
        const [startHour] = daySchedule.inicio.split(':').map(Number);
        const [endHour] = daySchedule.cierre.split(':').map(Number);

        if (startHour < earliestHour) earliestHour = startHour;
        if (endHour > latestHour) latestHour = endHour;
      }
    });

    // Si no hay días abiertos, usar valores por defecto
    if (earliestHour === 24) earliestHour = 8;
    if (latestHour === 0) latestHour = 21;

    return {
      minTime: new Date(2024, 1, 1, Math.max(0, earliestHour - 1), 0, 0),
      maxTime: new Date(2024, 1, 1, Math.min(23, latestHour + 1), 0, 0),
    };
  }, [schedule]);

  // Personalizar estilos de eventos según el estado
  const eventStyleGetter = useCallback((event) => {
    const status = event.resource.estado;
    let backgroundColor = '#3b82f6'; // blue-500 default
    let borderColor = '#2563eb'; // blue-600

    switch (status) {
      case 'pendiente':
        backgroundColor = '#eab308'; // yellow-500
        borderColor = '#ca8a04'; // yellow-600
        break;
      case 'confirmada':
        backgroundColor = '#22c55e'; // green-500
        borderColor = '#16a34a'; // green-600
        break;
      case 'completada':
        backgroundColor = '#6b7280'; // gray-500
        borderColor = '#4b5563'; // gray-600
        break;
      case 'cancelada':
        backgroundColor = '#ef4444'; // red-500
        borderColor = '#dc2626'; // red-600
        break;
      case 'no_show':
        backgroundColor = '#f97316'; // orange-500
        borderColor = '#ea580c'; // orange-600
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        display: 'block',
        fontSize: '0.875rem',
        padding: '2px 5px',
      },
    };
  }, []);

  // Mensajes en español
  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Cita',
    noEventsInRange: 'No hay citas en este rango',
    showMore: (total) => `+ Ver más (${total})`,
  };

  // Formatos personalizados
  const formats = {
    dayHeaderFormat: 'dddd DD/MM',
    dayRangeHeaderFormat: ({ start, end }) =>
      `${moment(start).format('DD/MM/YYYY')} - ${moment(end).format('DD/MM/YYYY')}`,
    agendaDateFormat: 'DD/MM/YYYY',
    agendaTimeFormat: 'HH:mm',
    agendaTimeRangeFormat: ({ start, end }) =>
      `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
  };

  return (
    <div className="h-[600px] bg-white rounded-lg border border-gray-200 p-4">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        onEventDrop={onEventDrop}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        slotPropGetter={slotPropGetter}
        messages={messages}
        formats={formats}
        selectable
        resizable
        draggableAccessor={() => true}
        style={{ height: '100%' }}
        step={15}
        timeslots={4}
        min={minTime}
        max={maxTime}
        culture="es"
      />
    </div>
  );
};

export default AppointmentCalendar;
