import { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import BusinessSettings from '../components/settings/BusinessSettings';
import ScheduleSettings from '../components/settings/ScheduleSettings';
import IntegrationSettings from '../components/settings/IntegrationSettings';
import { negocioAPI } from '../services/api';

const Settings = () => {
  const { tenantConfig, updateTenantConfig, loadTenantConfig } = useTenant();
  const [activeTab, setActiveTab] = useState('business');

  const handleSaveBusinessSettings = async (data) => {
    const result = await updateTenantConfig(data);
    if (result.success) {
      alert('Configuración actualizada exitosamente');
      await loadTenantConfig();
    } else {
      alert(result.error || 'Error al actualizar la configuración');
    }
  };

  const handleSaveSchedule = async (horario) => {
    try {
      await negocioAPI.actualizarHorario({ horario });
      alert('Horario actualizado exitosamente');
      await loadTenantConfig();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar el horario');
    }
  };

  const tabs = [
    { id: 'business', label: 'Datos del Negocio', icon: '🏢' },
    { id: 'schedule', label: 'Horarios', icon: '🕐' },
    { id: 'integration', label: 'Integración n8n', icon: '🔗' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Configura tu negocio, horarios e integraciones
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pb-8">
        {activeTab === 'business' && (
          <BusinessSettings
            config={tenantConfig}
            onSave={handleSaveBusinessSettings}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleSettings
            horario={tenantConfig?.horario}
            onSave={handleSaveSchedule}
          />
        )}

        {activeTab === 'integration' && (
          <IntegrationSettings
            tenantId={localStorage.getItem('tenant_id')}
            apiKey={tenantConfig?.api_key}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
