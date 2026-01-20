import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import AppointmentCalendar from '../components/calendar/AppointmentCalendar';
import AppointmentForm from '../components/appointments/AppointmentForm';
import useAppointments from '../hooks/useAppointments';
import { useTenant } from '../context/TenantContext';
import { format } from 'date-fns';

const Calendar = () => {
  const { appointments, fetchAppointments, createAppointment, updateAppointment, loading } =
    useAppointments();
  const { tenantConfig } = useTenant();

  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    loadAppointments();

    // Auto-refresh cada 5 segundos
    const intervalId = setInterval(() => {
      loadAppointments();
    }, 5000);

    // Limpiar interval al desmontar componente
    return () => clearInterval(intervalId);
  }, []);

  const loadAppointments = async () => {
    // Cargar citas del mes actual
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    await fetchAppointments({
      fecha_inicio: format(start, 'yyyy-MM-dd'),
      fecha_fin: format(end, 'yyyy-MM-dd'),
    });
  };

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event.resource);
    setShowForm(true);
  };

  const handleSelectSlot = (slotInfo) => {
    // Crear cita nueva en el slot seleccionado
    setSelectedSlot({
      fecha: format(slotInfo.start, 'yyyy-MM-dd'),
      hora: format(slotInfo.start, 'HH:mm'),
    });
    setSelectedAppointment(null);
    setShowForm(true);
  };

  const handleEventDrop = async ({ event, start, end }) => {
    // Actualizar cita cuando se arrastra a otra hora/día
    const result = await updateAppointment(event.id, {
      fecha: format(start, 'yyyy-MM-dd'),
      hora: format(start, 'HH:mm'),
    });

    if (!result.success) {
      alert(result.error || 'Error al mover la cita');
      await loadAppointments(); // Recargar para restaurar
    }
  };

  const handleCreateAppointment = async (data) => {
    const result = await createAppointment(data);
    if (result.success) {
      setShowForm(false);
      setSelectedSlot(null);
      alert('Cita creada exitosamente');
    } else {
      alert(result.error || 'Error al crear la cita');
    }
  };

  const handleUpdateAppointment = async (data) => {
    const result = await updateAppointment(selectedAppointment.cita_id, data);
    if (result.success) {
      setShowForm(false);
      setSelectedAppointment(null);
      alert('Cita actualizada exitosamente');
    } else {
      alert(result.error || 'Error al actualizar la cita');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedAppointment(null);
    setSelectedSlot(null);
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600 mt-1">
            Vista de calendario de tus citas - Arrastra para mover citas
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedSlot(null);
            setSelectedAppointment(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Cita
        </button>
      </div>

      {/* Leyenda de colores */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Estados de citas:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500"></div>
            <span className="text-sm text-gray-600">Completada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-600">Cancelada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-sm text-gray-600">No Show</span>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <AppointmentCalendar
        appointments={appointments}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        schedule={tenantConfig?.horario}
      />

      {/* Formulario modal */}
      {showForm && (
        <AppointmentForm
          onClose={handleCloseForm}
          onSubmit={
            selectedAppointment ? handleUpdateAppointment : handleCreateAppointment
          }
          initialData={selectedAppointment || selectedSlot}
        />
      )}
    </div>
  );
};

export default Calendar;
