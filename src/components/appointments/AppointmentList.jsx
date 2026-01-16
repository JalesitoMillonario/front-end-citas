import { useState } from 'react';
import { Clock, User, Phone, MoreVertical, Edit, X, Check } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/dateHelpers';
import { getStatusColor, getStatusText } from '../../utils/formatters';

const AppointmentList = ({ appointments = [], onEdit, onCancel, onUpdateStatus }) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center py-8">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay citas
          </h3>
          <p className="text-gray-500">
            Crea tu primera cita para comenzar
          </p>
        </div>
      </div>
    );
  }

  const handleMenuToggle = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.cita_id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.cliente_nombre}
                      </p>
                      {appointment.cliente_telefono && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {appointment.cliente_telefono}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {appointment.servicio_nombre}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {formatDate(appointment.fecha)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {formatTime(appointment.hora_inicio)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      appointment.estado
                    )}`}
                  >
                    {getStatusText(appointment.estado)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() => handleMenuToggle(appointment.cita_id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>

                    {openMenuId === appointment.cita_id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onEdit(appointment);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              onUpdateStatus(appointment.cita_id, 'confirmada');
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Confirmar
                          </button>
                          <button
                            onClick={() => {
                              onCancel(appointment);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentList;
