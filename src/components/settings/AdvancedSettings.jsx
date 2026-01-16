import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, AlertCircle, CheckCircle, Webhook } from 'lucide-react';

const AdvancedSettings = ({ config, onSave }) => {
  const [formData, setFormData] = useState({
    webhook_recordatorios_url: '',
    webhook_eventos_url: '',
    webhooks_activos: true,
    recordatorio_horas_antes: 12,
    recordatorio_activo: true,
    enviar_confirmacion_automatica: true,
    permitir_cancelacion_cliente: true,
    tiempo_minimo_cancelacion: 2, // horas
    intervalo_slots_minutos: 30,
  });

  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  useEffect(() => {
    if (config) {
      setFormData({
        webhook_recordatorios_url: config.webhook_recordatorios_url || '',
        webhook_eventos_url: config.webhook_eventos_url || '',
        webhooks_activos: config.webhooks_activos !== false,
        recordatorio_horas_antes: config.recordatorio_horas_antes || 12,
        recordatorio_activo: config.recordatorio_activo !== false,
        enviar_confirmacion_automatica: config.enviar_confirmacion_automatica !== false,
        permitir_cancelacion_cliente: config.permitir_cancelacion_cliente !== false,
        tiempo_minimo_cancelacion: config.tiempo_minimo_cancelacion || 2,
        intervalo_slots_minutos: config.intervalo_slots_minutos || 30,
      });
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await onSave(formData);
    setLoading(false);
  };

  const testWebhook = async () => {
    if (!formData.webhook_recordatorios_url) {
      alert('Por favor ingresa una URL de webhook primero');
      return;
    }

    setTestStatus('testing');

    try {
      const response = await fetch(formData.webhook_recordatorios_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'test',
          mensaje: 'Prueba de webhook desde el sistema de citas',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setTestStatus('success');
        setTimeout(() => setTestStatus(null), 3000);
      } else {
        setTestStatus('error');
        setTimeout(() => setTestStatus(null), 3000);
      }
    } catch (error) {
      console.error('Error al probar webhook:', error);
      setTestStatus('error');
      setTimeout(() => setTestStatus(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Configuración Avanzada
          </h3>
          <p className="text-sm text-gray-600">
            Configuración específica para tu negocio y integraciones
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Webhook para Recordatorios */}
        <div className="border-l-4 border-blue-500 pl-4">
          <div className="flex items-center gap-2 mb-3">
            <Webhook className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">
              Webhook de Recordatorios
            </h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del Webhook (n8n)
              </label>
              <input
                type="url"
                name="webhook_recordatorios_url"
                value={formData.webhook_recordatorios_url}
                onChange={handleChange}
                placeholder="https://tu-n8n.com/webhook/recordatorio-cita"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL del webhook de n8n donde se enviarán los recordatorios automáticos
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={testWebhook}
                disabled={!formData.webhook_recordatorios_url || testStatus === 'testing'}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testStatus === 'testing' ? 'Probando...' : 'Probar Webhook'}
              </button>

              {testStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Webhook funciona correctamente</span>
                </div>
              )}

              {testStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Error al conectar con webhook</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Webhook para Eventos */}
        <div className="border-l-4 border-indigo-500 pl-4">
          <div className="flex items-center gap-2 mb-3">
            <Webhook className="w-5 h-5 text-indigo-600" />
            <h4 className="font-semibold text-gray-900">
              Webhook de Eventos
            </h4>
          </div>

          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-indigo-800">
                <strong>Eventos disponibles:</strong> cita_creada, cita_actualizada, cita_cancelada, cita_confirmada, cita_completada
              </p>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="webhooks_activos"
                name="webhooks_activos"
                checked={formData.webhooks_activos}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="webhooks_activos" className="text-sm font-medium text-gray-700">
                Activar webhooks de eventos
              </label>
            </div>

            {formData.webhooks_activos && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Webhook de Eventos (n8n)
                </label>
                <input
                  type="url"
                  name="webhook_eventos_url"
                  value={formData.webhook_eventos_url}
                  onChange={handleChange}
                  placeholder="https://tu-n8n.com/webhook/eventos-citas"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL donde se enviarán todos los eventos (crear, actualizar, cancelar, confirmar, completar citas)
                </p>
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  💡 Cada webhook incluye un campo "evento" para distinguir el tipo de acción
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Configuración de Recordatorios */}
        <div className="border-l-4 border-green-500 pl-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Recordatorios Automáticos
          </h4>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recordatorio_activo"
                name="recordatorio_activo"
                checked={formData.recordatorio_activo}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="recordatorio_activo" className="text-sm font-medium text-gray-700">
                Activar recordatorios automáticos
              </label>
            </div>

            {formData.recordatorio_activo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enviar recordatorio (horas antes de la cita)
                </label>
                <select
                  name="recordatorio_horas_antes"
                  value={formData.recordatorio_horas_antes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">1 hora antes</option>
                  <option value="2">2 horas antes</option>
                  <option value="6">6 horas antes</option>
                  <option value="12">12 horas antes</option>
                  <option value="24">24 horas antes (1 día)</option>
                  <option value="48">48 horas antes (2 días)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  El sistema revisará cada 30 minutos y enviará recordatorios automáticamente
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Configuración de Citas */}
        <div className="border-l-4 border-purple-500 pl-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Gestión de Citas
          </h4>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enviar_confirmacion_automatica"
                name="enviar_confirmacion_automatica"
                checked={formData.enviar_confirmacion_automatica}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enviar_confirmacion_automatica" className="text-sm font-medium text-gray-700">
                Enviar confirmación automática al crear cita
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="permitir_cancelacion_cliente"
                name="permitir_cancelacion_cliente"
                checked={formData.permitir_cancelacion_cliente}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="permitir_cancelacion_cliente" className="text-sm font-medium text-gray-700">
                Permitir que clientes cancelen por WhatsApp/chatbot
              </label>
            </div>

            {formData.permitir_cancelacion_cliente && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo mínimo para cancelar (horas antes)
                </label>
                <input
                  type="number"
                  name="tiempo_minimo_cancelacion"
                  value={formData.tiempo_minimo_cancelacion}
                  onChange={handleChange}
                  min="0"
                  max="72"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Clientes no podrán cancelar si falta menos de este tiempo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Configuración de Disponibilidad */}
        <div className="border-l-4 border-yellow-500 pl-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Disponibilidad y Horarios
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo entre slots de citas (minutos)
              </label>
              <select
                name="intervalo_slots_minutos"
                value={formData.intervalo_slots_minutos}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Intervalo de tiempo entre slots disponibles al consultar disponibilidad
              </p>
            </div>
          </div>
        </div>

        {/* Aviso Importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Importante:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Estos ajustes son específicos para tu negocio</li>
                <li>Los cambios se aplican inmediatamente</li>
                <li>Asegúrate de tener n8n configurado antes de activar recordatorios</li>
                <li>Prueba el webhook antes de activar los recordatorios</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedSettings;
