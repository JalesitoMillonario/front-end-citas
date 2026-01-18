import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import AppointmentList from '../components/appointments/AppointmentList';
import AppointmentForm from '../components/appointments/AppointmentForm';
import useAppointments from '../hooks/useAppointments';

const Appointments = () => {
  const {
    appointments,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    loading,
  } = useAppointments();

  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
    await fetchAppointments();
  };

  const handleCreateAppointment = async (data) => {
    const result = await createAppointment(data);
    if (result.success) {
      setShowForm(false);
      alert('Cita creada exitosamente');
    } else {
      alert(result.error || 'Error al crear la cita');
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleUpdateAppointment = async (data) => {
    const result = await updateAppointment(editingAppointment.cita_id, data);
    if (result.success) {
      setShowForm(false);
      setEditingAppointment(null);
      alert('Cita actualizada exitosamente');
    } else {
      alert(result.error || 'Error al actualizar la cita');
    }
  };

  const handleCancelAppointment = async (appointment) => {
    const motivo = prompt('Motivo de cancelación (opcional):');
    if (motivo !== null) {
      const result = await cancelAppointment(appointment.cita_id, motivo);
      if (result.success) {
        alert('Cita cancelada exitosamente');
      } else {
        alert(result.error || 'Error al cancelar la cita');
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const result = await updateAppointment(id, { estado: status });
    if (result.success) {
      alert('Estado actualizado exitosamente');
    } else {
      alert(result.error || 'Error al actualizar el estado');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAppointment(null);
  };

  // Filtrar citas
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.servicio_nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || apt.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todas las citas de tu negocio
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Cita
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de citas */}
      {loading && appointments.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando citas...</p>
          </div>
        </div>
      ) : (
        <AppointmentList
          appointments={filteredAppointments}
          onEdit={handleEditAppointment}
          onCancel={handleCancelAppointment}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Formulario modal */}
      {showForm && (
        <AppointmentForm
          onClose={handleCloseForm}
          onSubmit={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}
          initialData={editingAppointment}
        />
      )}
    </div>
  );
};

export default Appointments;
