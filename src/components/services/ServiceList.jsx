import { Edit, Trash2 } from 'lucide-react';
import { formatPrice, formatDuration } from '../../utils/formatters';

const ServiceList = ({ services = [], onEdit, onDelete }) => {
  if (services.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay servicios
          </h3>
          <p className="text-gray-500">
            Crea tu primer servicio para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <div
          key={service.servicio_id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {service.nombre}
              </h3>
              {service.descripcion && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {service.descripcion}
                </p>
              )}
            </div>
            <div className={`ml-2 ${service.activo ? 'text-green-500' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${service.activo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </div>

          {/* Detalles */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Duración:</span>
              <span className="font-medium text-gray-900">
                {formatDuration(service.duracion)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Precio:</span>
              <span className="font-semibold text-blue-600">
                {formatPrice(service.precio)}
              </span>
            </div>
            {service.categoria && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Categoría:</span>
                <span className="text-gray-900">{service.categoria}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => onEdit(service)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={() => onDelete(service.servicio_id)}
              className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
