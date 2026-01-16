import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ServiceForm = ({ onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: 30,
    precio: 0,
    categoria: '',
    activo: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        duracion: initialData.duracion || 30,
        precio: initialData.precio || 0,
        categoria: initialData.categoria || '',
        activo: initialData.activo !== undefined ? initialData.activo : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validación
    if (!formData.nombre || !formData.duracion || formData.precio < 0) {
      alert('Por favor completa todos los campos obligatorios');
      setLoading(false);
      return;
    }

    // Convertir a números
    const dataToSubmit = {
      ...formData,
      duracion: parseInt(formData.duracion, 10),
      precio: parseFloat(formData.precio),
    };

    await onSubmit(dataToSubmit);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Editar Servicio' : 'Nuevo Servicio'}
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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del servicio *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Corte de cabello"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Descripción del servicio..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Duración y Precio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos) *
              </label>
              <input
                type="number"
                name="duracion"
                value={formData.duracion}
                onChange={handleChange}
                min="5"
                step="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (€) *
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <input
              type="text"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              placeholder="Ej: Peluquería, Estética, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Activo */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">
              Servicio activo
            </label>
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
              {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
