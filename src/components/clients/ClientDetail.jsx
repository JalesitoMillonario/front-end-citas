import { X, User, Phone, Mail, Calendar, Clock, Edit } from 'lucide-react';
import { formatPhone, formatPrice, getStatusColor, getStatusText } from '../../utils/formatters';
import { formatDate, formatTime } from '../../utils/dateHelpers';

const ClientDetail = ({ client, appointments = [], onClose, onEdit, onNewAppointment }) => {
  if (!client) return null;

  const totalGastado = appointments
    .filter((apt) => apt.estado === 'completada')
    .reduce((sum, apt) => sum + (apt.precio_servicio || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{client.nombre}</h2>
              <p className="text-sm text-gray-500">Cliente desde {client.created_at || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Información del cliente */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Teléfono */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="font-medium text-gray-900">{formatPhone(client.telefono)}</p>
              </div>
            </div>

            {/* Email */}
            {client.email && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{client.email}</p>
                </div>
              </div>
            )}

            {/* Total citas */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total de citas</p>
                <p className="font-medium text-gray-900">{appointments.length}</p>
              </div>
            </div>

            {/* Total gastado */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-lg">💰</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total gastado</p>
                <p className="font-medium text-gray-900">{formatPrice(totalGastado)}</p>
              </div>
            </div>
          </div>

          {/* Notas */}
          {client.notas && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Notas</p>
              <p className="text-sm text-gray-700">{client.notas}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onEdit(client)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar Cliente
            </button>
            <button
              onClick={() => onNewAppointment(client)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Nueva Cita
            </button>
          </div>
        </div>

        {/* Historial de citas */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Historial de Citas ({appointments.length})
          </h3>

          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay citas registradas</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {appointments.map((apt) => (
                <div
                  key={apt.cita_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-900">{apt.servicio_nombre}</p>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            apt.estado
                          )}`}
                        >
                          {getStatusText(apt.estado)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(apt.fecha)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(apt.hora_inicio)}
                        </span>
                      </div>

                      {apt.notas && (
                        <p className="text-xs text-gray-500 mt-2 italic">{apt.notas}</p>
                      )}
                    </div>

                    {apt.precio_servicio && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600">
                          {formatPrice(apt.precio_servicio)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
