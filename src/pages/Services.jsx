import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import ServiceList from '../components/services/ServiceList';
import ServiceForm from '../components/services/ServiceForm';
import useServices from '../hooks/useServices';

const Services = () => {
  const { services, fetchServices, createService, updateService, deleteService, loading } =
    useServices();

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    await fetchServices();
  };

  const handleCreateService = async (data) => {
    const result = await createService(data);
    if (result.success) {
      setShowForm(false);
      alert('Servicio creado exitosamente');
    } else {
      alert(result.error || 'Error al crear el servicio');
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleUpdateService = async (data) => {
    const result = await updateService(editingService.servicio_id, data);
    if (result.success) {
      setShowForm(false);
      setEditingService(null);
      alert('Servicio actualizado exitosamente');
    } else {
      alert(result.error || 'Error al actualizar el servicio');
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      const result = await deleteService(id);
      if (result.success) {
        alert('Servicio eliminado exitosamente');
      } else {
        alert(result.error || 'Error al eliminar el servicio');
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los servicios que ofreces en tu negocio
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Total de servicios</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{services.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Servicios activos</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {services.filter((s) => s.activo).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Servicios inactivos</p>
          <p className="text-3xl font-bold text-gray-400 mt-2">
            {services.filter((s) => !s.activo).length}
          </p>
        </div>
      </div>

      {/* Lista de servicios */}
      {loading && services.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando servicios...</p>
          </div>
        </div>
      ) : (
        <ServiceList
          services={services}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
        />
      )}

      {/* Formulario modal */}
      {showForm && (
        <ServiceForm
          onClose={handleCloseForm}
          onSubmit={editingService ? handleUpdateService : handleCreateService}
          initialData={editingService}
        />
      )}
    </div>
  );
};

export default Services;
