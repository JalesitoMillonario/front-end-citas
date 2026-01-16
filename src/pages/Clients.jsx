import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import ClientList from '../components/clients/ClientList';
import ClientForm from '../components/clients/ClientForm';
import ClientDetail from '../components/clients/ClientDetail';
import AppointmentForm from '../components/appointments/AppointmentForm';
import useClients from '../hooks/useClients';
import useAppointments from '../hooks/useAppointments';

const Clients = () => {
  const { clients, fetchClients, createClient, updateClient, loading } = useClients();
  const { appointments, fetchAppointments, createAppointment } = useAppointments();

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientAppointments, setClientAppointments] = useState([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    await fetchClients();
  };

  const handleCreateClient = async (data) => {
    const result = await createClient(data);
    if (result.success) {
      setShowForm(false);
      alert('Cliente creado exitosamente');
    } else {
      alert(result.error || 'Error al crear el cliente');
    }
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowForm(true);
    setShowDetail(false);
  };

  const handleUpdateClient = async (data) => {
    const result = await updateClient(selectedClient.cliente_id, data);
    if (result.success) {
      setShowForm(false);
      setSelectedClient(null);
      alert('Cliente actualizado exitosamente');
    } else {
      alert(result.error || 'Error al actualizar el cliente');
    }
  };

  const handleViewClient = async (client) => {
    setSelectedClient(client);
    // Cargar citas del cliente
    const apts = await fetchAppointments({ cliente_id: client.cliente_id });
    setClientAppointments(apts || []);
    setShowDetail(true);
  };

  const handleNewAppointment = (client) => {
    setSelectedClient(client);
    setShowDetail(false);
    setShowAppointmentForm(true);
  };

  const handleCreateAppointment = async (data) => {
    // Agregar el cliente_id al data
    const appointmentData = {
      ...data,
      cliente_id: selectedClient.cliente_id,
      cliente_nombre: selectedClient.nombre,
      cliente_telefono: selectedClient.telefono,
    };

    const result = await createAppointment(appointmentData);
    if (result.success) {
      setShowAppointmentForm(false);
      setSelectedClient(null);
      alert('Cita creada exitosamente');
    } else {
      alert(result.error || 'Error al crear la cita');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedClient(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedClient(null);
    setClientAppointments([]);
  };

  const handleCloseAppointmentForm = () => {
    setShowAppointmentForm(false);
    setSelectedClient(null);
  };

  // Filtrar clientes
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telefono?.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu base de clientes y su historial
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Total de clientes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{clients.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Clientes activos</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {clients.filter((c) => c.total_citas > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Nuevos este mes</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Lista de clientes */}
      {loading && clients.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      ) : (
        <ClientList
          clients={filteredClients}
          onEdit={handleEditClient}
          onView={handleViewClient}
        />
      )}

      {/* Formulario de cliente */}
      {showForm && (
        <ClientForm
          onClose={handleCloseForm}
          onSubmit={selectedClient ? handleUpdateClient : handleCreateClient}
          initialData={selectedClient}
        />
      )}

      {/* Detalle del cliente */}
      {showDetail && (
        <ClientDetail
          client={selectedClient}
          appointments={clientAppointments}
          onClose={handleCloseDetail}
          onEdit={handleEditClient}
          onNewAppointment={handleNewAppointment}
        />
      )}

      {/* Formulario de cita */}
      {showAppointmentForm && (
        <AppointmentForm
          onClose={handleCloseAppointmentForm}
          onSubmit={handleCreateAppointment}
          initialData={{
            cliente_id: selectedClient?.cliente_id,
            cliente_nombre: selectedClient?.nombre,
            cliente_telefono: selectedClient?.telefono,
          }}
        />
      )}
    </div>
  );
};

export default Clients;
