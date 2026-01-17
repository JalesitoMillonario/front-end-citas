import { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import BusinessSettings from '../components/settings/BusinessSettings';
import ScheduleSettings from '../components/settings/ScheduleSettings';
import IntegrationSettings from '../components/settings/IntegrationSettings';
import AdvancedSettings from '../components/settings/AdvancedSettings';
import LanguageSettings from '../components/settings/LanguageSettings';
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

  const handleSaveAdvancedSettings = async (advancedConfig) => {
    try {
      // Guardar en el campo config del negocio
      await negocioAPI.actualizarConfig({ config: advancedConfig });
      alert('Configuración avanzada guardada exitosamente');
      await loadTenantConfig();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar configuración avanzada');
    }
  };

  const tabs = [
    { id: 'business', label: 'Business Data' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'integration', label: 'n8n Integration' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'language', label: 'Language' },
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
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
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

        {activeTab === 'advanced' && (
          <AdvancedSettings
            config={tenantConfig?.config || {}}
            onSave={handleSaveAdvancedSettings}
          />
        )}

        {activeTab === 'language' && (
          <LanguageSettings />
        )}
      </div>
    </div>
  );
};

export default Settings;
