import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useServices from '../../hooks/useServices';
import useClients from '../../hooks/useClients';
import { format } from 'date-fns';

const AppointmentForm = ({ onClose, onSubmit, initialData = null }) => {
  const { services, fetchServices } = useServices();
  const { clients, fetchClients } = useClients();

  const [formData, setFormData] = useState({
    cliente_id: '',
    cliente_nombre: '',
    cliente_telefono: '',
    servicio_id: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: '',
    notas: '',
  });

  const [isNewClient, setIsNewClient] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchClients();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        cliente_id: initialData.cliente_id || '',
        cliente_nombre: initialData.cliente_nombre || '',
        cliente_telefono: initialData.cliente_telefono || '',
        servicio_id: initialData.servicio_id || '',
        fecha: initialData.fecha || format(new Date(), 'yyyy-MM-dd'),
        hora: initialData.hora_inicio || '',
        notas: initialData.notas || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;

    if (clientId === 'new') {
      setIsNewClient(true);
      setFormData((prev) => ({
        ...prev,
        cliente_id: '',
        cliente_nombre: '',
        cliente_telefono: '',
      }));
    } else {
      setIsNewClient(false);
      const selectedClient = clients.find((c) => c.cliente_id === clientId);
      if (selectedClient) {
        setFormData((prev) => ({
          ...prev,
          cliente_id: clientId,
          cliente_nombre: selectedClient.nombre,
          cliente_telefono: selectedClient.telefono,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validación básica
    if (!formData.servicio_id || !formData.fecha || !formData.hora) {
      alert('Por favor completa todos los campos obligatorios');
      setLoading(false);
      return;
    }

    if (isNewClient && (!formData.cliente_nombre || !formData.cliente_telefono)) {
      alert('Por favor completa el nombre y teléfono del cliente');
      setLoading(false);
      return;
    }

    if (!isNewClient && !formData.cliente_id) {
      alert('Por favor selecciona un cliente');
      setLoading(false);
      return;
    }

    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            {!isNewClient ? (
              <select
                onChange={handleClientChange}
                value={formData.cliente_id}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map((client) => (
                  <option key={client.cliente_id} value={client.cliente_id}>
                    {client.nombre} - {client.telefono}
                  </option>
                ))}
                <option value="new">+ Nuevo cliente</option>
              </select>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  name="cliente_nombre"
                  value={formData.cliente_nombre}
                  onChange={handleChange}
                  placeholder="Nombre del cliente"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  type="tel"
                  name="cliente_telefono"
                  value={formData.cliente_telefono}
                  onChange={handleChange}
                  placeholder="Teléfono"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsNewClient(false)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Seleccionar cliente existente
                </button>
              </div>
            )}
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicio *
            </label>
            <select
              name="servicio_id"
              value={formData.servicio_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar servicio...</option>
              {services.map((service) => (
                <option key={service.servicio_id} value={service.servicio_id}>
                  {service.nombre} - {service.duracion} min - {service.precio}€
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora *
            </label>
            <input
              type="time"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              placeholder="Notas adicionales..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
