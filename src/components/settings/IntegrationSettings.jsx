import { useState } from 'react';
import { Copy, CheckCircle, Key, Webhook } from 'lucide-react';

const IntegrationSettings = ({ tenantId, apiKey }) => {
  const [copied, setCopied] = useState({ tenantId: false, apiKey: false });

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [field]: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [field]: false }));
      }, 2000);
    } catch (err) {
      alert('Error al copiar al portapapeles');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Webhook className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Integración con n8n
          </h3>
          <p className="text-sm text-gray-600">
            Credenciales para conectar con tu chatbot de WhatsApp
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tenant ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Tenant ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tenantId || 'Cargando...'}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm"
            />
            <button
              onClick={() => handleCopy(tenantId, 'tenantId')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Copiar"
            >
              {copied.tenantId ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Usa este ID para identificar tu negocio en n8n
          </p>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Key
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiKey || 'Cargando...'}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm"
            />
            <button
              onClick={() => handleCopy(apiKey, 'apiKey')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Copiar"
            >
              {copied.apiKey ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Clave secreta para autenticar las peticiones desde n8n
          </p>
        </div>

        {/* Instrucciones */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Configuración en n8n:
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Copia el Tenant ID y API Key</li>
            <li>En tu workflow de n8n, configura las credenciales</li>
            <li>URL base: <code className="bg-blue-100 px-2 py-0.5 rounded">
              {import.meta.env.VITE_API_BASE_URL || 'https://tu-dominio.com/api'}
            </code></li>
            <li>Prueba la conexión creando una cita de prueba</li>
          </ol>
        </div>

        {/* Endpoints disponibles */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Endpoints disponibles:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded font-mono text-xs">
              <span className="text-green-600 font-semibold">POST</span>
              <span className="text-gray-700">/api/citas/crear</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded font-mono text-xs">
              <span className="text-blue-600 font-semibold">GET</span>
              <span className="text-gray-700">/api/citas/listar</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded font-mono text-xs">
              <span className="text-blue-600 font-semibold">GET</span>
              <span className="text-gray-700">/api/citas/disponibilidad</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded font-mono text-xs">
              <span className="text-orange-600 font-semibold">PUT</span>
              <span className="text-gray-700">/api/citas/actualizar/:id</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded font-mono text-xs">
              <span className="text-red-600 font-semibold">DELETE</span>
              <span className="text-gray-700">/api/citas/cancelar/:id</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;
