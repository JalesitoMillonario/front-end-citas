import { Clock, User, Phone } from 'lucide-react';
import { formatTime } from '../../utils/dateHelpers';
import { getStatusColor, getStatusText } from '../../utils/formatters';

const TodayAppointments = ({ appointments = [] }) => {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Citas de Hoy
        </h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay citas programadas para hoy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Citas de Hoy ({appointments.length})
      </h3>

      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div
            key={appointment.cita_id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Información principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="font-medium text-gray-900 truncate">
                    {appointment.cliente_nombre}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {formatTime(appointment.hora_inicio)} - {formatTime(appointment.hora_fin)}
                  </span>
                </div>

                {appointment.cliente_telefono && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{appointment.cliente_telefono}</span>
                  </div>
                )}

                <p className="text-sm text-gray-700 mt-2">
                  {appointment.servicio_nombre}
                </p>

                {appointment.notas && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {appointment.notas}
                  </p>
                )}
              </div>

              {/* Estado */}
              <div>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    appointment.estado
                  )}`}
                >
                  {getStatusText(appointment.estado)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayAppointments;
