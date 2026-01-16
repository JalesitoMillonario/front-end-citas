import { useState, useEffect } from 'react';
import { Clock, Save, X } from 'lucide-react';

const ScheduleSettings = ({ horario, onSave }) => {
  const [schedule, setSchedule] = useState({
    lunes: { abierto: true, inicio: '09:00', fin: '19:00', pausas: [] },
    martes: { abierto: true, inicio: '09:00', fin: '19:00', pausas: [] },
    miercoles: { abierto: true, inicio: '09:00', fin: '19:00', pausas: [] },
    jueves: { abierto: true, inicio: '09:00', fin: '19:00', pausas: [] },
    viernes: { abierto: true, inicio: '09:00', fin: '19:00', pausas: [] },
    sabado: { abierto: false, inicio: '09:00', fin: '14:00', pausas: [] },
    domingo: { abierto: false, inicio: '09:00', fin: '14:00', pausas: [] },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (horario && Object.keys(horario).length > 0) {
      setSchedule(horario);
    }
  }, [horario]);

  const diasSemana = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
  ];

  const handleToggleDay = (dia) => {
    setSchedule((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        abierto: !prev[dia].abierto,
      },
    }));
  };

  const handleTimeChange = (dia, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [field]: value,
      },
    }));
  };

  const handleAddPausa = (dia) => {
    setSchedule((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        pausas: [
          ...(prev[dia].pausas || []),
          { inicio: '14:00', fin: '16:00' },
        ],
      },
    }));
  };

  const handleRemovePausa = (dia, index) => {
    setSchedule((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        pausas: prev[dia].pausas.filter((_, i) => i !== index),
      },
    }));
  };

  const handlePausaChange = (dia, index, field, value) => {
    setSchedule((prev) => {
      const newPausas = [...prev[dia].pausas];
      newPausas[index] = {
        ...newPausas[index],
        [field]: value,
      };
      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          pausas: newPausas,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await onSave(schedule);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Horario de Apertura
          </h3>
          <p className="text-sm text-gray-600">
            Configura los días y horarios de trabajo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {diasSemana.map(({ key, label }) => (
          <div
            key={key}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`abierto-${key}`}
                  checked={schedule[key].abierto}
                  onChange={() => handleToggleDay(key)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`abierto-${key}`}
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {label}
                </label>
              </div>
              {!schedule[key].abierto && (
                <span className="text-sm text-red-600 font-medium">Cerrado</span>
              )}
            </div>

            {schedule[key].abierto && (
              <div className="space-y-3 ml-8">
                {/* Horario principal */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Apertura
                    </label>
                    <input
                      type="time"
                      value={schedule[key].inicio}
                      onChange={(e) =>
                        handleTimeChange(key, 'inicio', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Cierre
                    </label>
                    <input
                      type="time"
                      value={schedule[key].fin}
                      onChange={(e) =>
                        handleTimeChange(key, 'fin', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Pausas */}
                {schedule[key].pausas && schedule[key].pausas.length > 0 && (
                  <div className="space-y-2">
                    {schedule[key].pausas.map((pausa, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={pausa.inicio}
                          onChange={(e) =>
                            handlePausaChange(key, index, 'inicio', e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="time"
                          value={pausa.fin}
                          onChange={(e) =>
                            handlePausaChange(key, index, 'fin', e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePausa(key, index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón agregar pausa */}
                <button
                  type="button"
                  onClick={() => handleAddPausa(key)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Agregar pausa
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Botón de guardar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar Horario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleSettings;
