import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getStatusColor } from '../../utils/formatters';

moment.locale('es');
const localizer = momentLocalizer(moment);

const AppointmentCalendar = ({ appointments = [], onSelectEvent, onSelectSlot, onEventDrop }) => {
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
        messages={messages}
        formats={formats}
        selectable
        resizable
        draggableAccessor={() => true}
        style={{ height: '100%' }}
        step={15}
        timeslots={4}
        min={new Date(2024, 1, 1, 8, 0, 0)} // 8:00 AM
        max={new Date(2024, 1, 1, 21, 0, 0)} // 9:00 PM
        culture="es"
      />
    </div>
  );
};

export default AppointmentCalendar;
