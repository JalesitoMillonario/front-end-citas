import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, AlertCircle, CheckCircle, Webhook } from 'lucide-react';

const AdvancedSettings = ({ config, onSave }) => {
  const [formData, setFormData] = useState({
    webhook_url: '',
    webhooks_activos: true,
    recordatorio_horas_antes: 12,
    recordatorio_activo: true,
    enviar_confirmacion_automatica: true,
    permitir_cancelacion_cliente: true,
    tiempo_minimo_cancelacion: 2,
    intervalo_slots_minutos: 30,
  });

  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  useEffect(() => {
    if (config) {
      setFormData({
        webhook_url: config.webhook_url || '',
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
    if (!formData.webhook_url) {
      alert('Please enter a webhook URL first');
      return;
    }

    setTestStatus('testing');

    try {
      const token = localStorage.getItem('token');
      console.log('🧪 Testing webhook:', formData.webhook_url);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/test/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          webhook_url: formData.webhook_url,
        }),
      });

      const data = await response.json();
      console.log('🧪 Webhook test response:', data);

      if (response.ok && data.success) {
        console.log('✅ Webhook test successful');
        setTestStatus('success');
        setTimeout(() => setTestStatus(null), 3000);
      } else {
        console.error('❌ Webhook test failed:', data);
        alert(`Webhook test failed: ${data.error || 'Unknown error'}\nDetails: ${data.details || 'N/A'}`);
        setTestStatus('error');
        setTimeout(() => setTestStatus(null), 3000);
      }
    } catch (error) {
      console.error('❌ Webhook test error:', error);
      alert(`Network error testing webhook: ${error.message}`);
      setTestStatus('error');
      setTimeout(() => setTestStatus(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
        <div className="p-2 bg-gray-900 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Advanced Configuration
          </h3>
          <p className="text-sm text-gray-600">
            Business-specific configuration and integrations
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Unified Webhook */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Webhook className="w-5 h-5 text-gray-900" />
            <h4 className="font-semibold text-gray-900">Webhook Integration</h4>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2 font-medium">Unified Webhook</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              All events are sent to the same webhook URL. Use the "evento" field to distinguish:
              <span className="block mt-2 font-mono text-xs bg-white p-2 rounded border border-gray-200">
                cita_creada, cita_actualizada, cita_cancelada, cita_confirmada, cita_completada, recordatorio_enviado
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="webhooks_activos"
              name="webhooks_activos"
              checked={formData.webhooks_activos}
              onChange={handleChange}
              className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
            />
            <label htmlFor="webhooks_activos" className="text-sm font-medium text-gray-700">
              Enable webhooks
            </label>
          </div>

          {formData.webhooks_activos && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL (n8n)
                </label>
                <input
                  type="url"
                  name="webhook_url"
                  value={formData.webhook_url}
                  onChange={handleChange}
                  placeholder="https://your-n8n.com/webhook/appointments"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  All events will be sent to this URL
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={testWebhook}
                  disabled={!formData.webhook_url || testStatus === 'testing'}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {testStatus === 'testing' ? 'Testing...' : 'Test Webhook'}
                </button>

                {testStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Webhook works correctly</span>
                  </div>
                )}

                {testStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connection error</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Reminders */}
        <div className="border-t border-gray-200 pt-8">
          <h4 className="font-semibold text-gray-900 mb-4">Automatic Reminders</h4>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recordatorio_activo"
                name="recordatorio_activo"
                checked={formData.recordatorio_activo}
                onChange={handleChange}
                className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <label htmlFor="recordatorio_activo" className="text-sm font-medium text-gray-700">
                Enable automatic reminders
              </label>
            </div>

            {formData.recordatorio_activo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send reminder (hours before appointment)
                </label>
                <select
                  name="recordatorio_horas_antes"
                  value={formData.recordatorio_horas_antes}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="1">1 hour before</option>
                  <option value="2">2 hours before</option>
                  <option value="6">6 hours before</option>
                  <option value="12">12 hours before</option>
                  <option value="24">24 hours before (1 day)</option>
                  <option value="48">48 hours before (2 days)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Management */}
        <div className="border-t border-gray-200 pt-8">
          <h4 className="font-semibold text-gray-900 mb-4">Appointment Management</h4>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enviar_confirmacion_automatica"
                name="enviar_confirmacion_automatica"
                checked={formData.enviar_confirmacion_automatica}
                onChange={handleChange}
                className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <label htmlFor="enviar_confirmacion_automatica" className="text-sm font-medium text-gray-700">
                Send automatic confirmation when creating appointment
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="permitir_cancelacion_cliente"
                name="permitir_cancelacion_cliente"
                checked={formData.permitir_cancelacion_cliente}
                onChange={handleChange}
                className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <label htmlFor="permitir_cancelacion_cliente" className="text-sm font-medium text-gray-700">
                Allow clients to cancel via WhatsApp/chatbot
              </label>
            </div>

            {formData.permitir_cancelacion_cliente && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum time to cancel (hours before)
                </label>
                <input
                  type="number"
                  name="tiempo_minimo_cancelacion"
                  value={formData.tiempo_minimo_cancelacion}
                  onChange={handleChange}
                  min="0"
                  max="72"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="border-t border-gray-200 pt-8">
          <h4 className="font-semibold text-gray-900 mb-4">Availability and Schedule</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot interval (minutes)
            </label>
            <select
              name="intervalo_slots_minutos"
              value={formData.intervalo_slots_minutos}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 font-medium"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedSettings;
