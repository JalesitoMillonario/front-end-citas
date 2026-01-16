import { useState, useEffect } from 'react';
import { Building2, Save } from 'lucide-react';

const BusinessSettings = ({ config, onSave }) => {
  const [formData, setFormData] = useState({
    nombre_negocio: '',
    tipo_negocio: '',
    direccion: '',
    telefono: '',
    email: '',
    logo_url: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        nombre_negocio: config.nombre_negocio || '',
        tipo_negocio: config.tipo_negocio || '',
        direccion: config.direccion || '',
        telefono: config.telefono || '',
        email: config.email || '',
        logo_url: config.logo_url || '',
      });
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await onSave(formData);
    setLoading(false);
  };

  const tiposNegocio = [
    'Estética',
    'Peluquería',
    'Barbería',
    'Fisioterapia',
    'Spa',
    'Centro de masajes',
    'Clínica dental',
    'Centro médico',
    'Otro',
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Datos del Negocio
          </h3>
          <p className="text-sm text-gray-600">
            Información básica de tu negocio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre del negocio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del negocio *
          </label>
          <input
            type="text"
            name="nombre_negocio"
            value={formData.nombre_negocio}
            onChange={handleChange}
            placeholder="Ej: Estética María"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Tipo de negocio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de negocio *
          </label>
          <select
            name="tipo_negocio"
            value={formData.tipo_negocio}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Seleccionar tipo...</option>
            {tiposNegocio.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Calle, número, ciudad, código postal"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Teléfono y Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono de contacto
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="612345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de contacto
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contacto@tunegocio.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL del Logo
          </label>
          <input
            type="url"
            name="logo_url"
            value={formData.logo_url}
            onChange={handleChange}
            placeholder="https://ejemplo.com/logo.png"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL pública de tu logo (opcional)
          </p>
        </div>

        {/* Vista previa del logo */}
        {formData.logo_url && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Vista previa del logo:
            </p>
            <img
              src={formData.logo_url}
              alt="Logo"
              className="h-16 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Botón de guardar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessSettings;
