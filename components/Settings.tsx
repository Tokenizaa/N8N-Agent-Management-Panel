import React, { useState } from 'react';
import { AgentConfig } from '../types';

interface SettingsProps {
  config: AgentConfig;
  onUpdate: (newConfig: Partial<AgentConfig>) => void;
  n8nUrls: { load: string; actions: string };
  onUpdateN8nUrls: (urls: { load: string; actions: string }) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onUpdate, n8nUrls, onUpdateN8nUrls }) => {
  // State for agent settings
  const [waitTime, setWaitTime] = useState(config.waitTime);
  const [notificationTrigger, setNotificationTrigger] = useState(config.notificationTrigger);
  const [notificationNumbers, setNotificationNumbers] = useState(config.notificationNumbers);
  
  // State for N8N URL settings
  const [loadUrl, setLoadUrl] = useState(n8nUrls.load);
  const [actionsUrl, setActionsUrl] = useState(n8nUrls.actions);

  const handleUpdateAgentSettings = () => {
    onUpdate({ waitTime, notificationTrigger, notificationNumbers });
  };
  
  const handleUpdateN8NConnection = () => {
    if (!loadUrl.trim() || !actionsUrl.trim()) {
      alert('Por favor, preencha ambas as URLs de Webhook do N8N.');
      return;
    }
    onUpdateN8nUrls({ load: loadUrl, actions: actionsUrl });
  };
  
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* N8N Connection Section */}
      <div className="p-4 bg-surface-bright rounded-lg border border-primary/30 space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Conexão N8N</h3>
        <p className="text-sm text-text-secondary">
          Configure as URLs dos webhooks do N8N para que o painel possa se comunicar com seus workflows. Estes valores são salvos no seu navegador.
        </p>
        <div className="space-y-2">
          <label htmlFor="load-url" className="block text-sm font-medium text-text-secondary">
            Webhook URL (Carregar Dados - GET)
          </label>
          <input
            type="text"
            id="load-url"
            value={loadUrl}
            onChange={(e) => setLoadUrl(e.target.value)}
            placeholder="https://seu-n8n.com/webhook/load-panel-data"
            className="w-full bg-background border border-surface-bright rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="actions-url" className="block text-sm font-medium text-text-secondary">
            Webhook URL (Ações - POST)
          </label>
          <input
            type="text"
            id="actions-url"
            value={actionsUrl}
            onChange={(e) => setActionsUrl(e.target.value)}
            placeholder="https://seu-n8n.com/webhook/update-panel-data"
            className="w-full bg-background border border-surface-bright rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
          />
        </div>
        <div className="flex justify-start pt-2">
          <button
            onClick={handleUpdateN8NConnection}
            className="px-8 py-2 rounded-lg font-semibold text-white bg-success hover:bg-opacity-80 transition duration-200"
          >
            Salvar Conexão N8N
          </button>
        </div>
      </div>
      
      {/* Agent Settings Section */}
      <div className="pt-4 space-y-6">
        <h3 className="text-lg font-semibold text-text-primary">Configurações do Agente</h3>
        <div className="space-y-2">
          <label htmlFor="wait-time" className="block text-sm font-medium text-text-secondary">
            Tempo de Espera (Wait)
          </label>
          <input
            type="number"
            id="wait-time"
            value={waitTime}
            onChange={(e) => setWaitTime(Number(e.target.value))}
            className="w-full bg-background border border-surface-bright rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="notification-trigger" className="block text-sm font-medium text-text-secondary">
            Gatilho de Notificação
          </label>
          <input
            type="text"
            id="notification-trigger"
            value={notificationTrigger}
            onChange={(e) => setNotificationTrigger(e.target.value)}
            className="w-full bg-background border border-surface-bright rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="notification-numbers" className="block text-sm font-medium text-text-secondary">
            Número para Notificação
          </label>
          <input
            type="text"
            id="notification-numbers"
            value={notificationNumbers}
            onChange={(e) => setNotificationNumbers(e.target.value)}
            className="w-full bg-background border border-surface-bright rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
          />
        </div>

        <div className="flex justify-start pt-4">
          <button
            onClick={handleUpdateAgentSettings}
            className="px-8 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-opacity-80 transition duration-200"
          >
            Salvar Configurações do Agente
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
