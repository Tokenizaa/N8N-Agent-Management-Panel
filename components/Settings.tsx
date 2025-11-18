import React, { useState } from 'react';
import { AgentConfig, User } from '../types';
import { SpinnerIcon } from './icons/Icons';

interface SettingsProps {
  config: AgentConfig;
  onUpdate: (newConfig: Partial<AgentConfig>) => void;
  n8nUrls: { load: string; actions: string };
  onUpdateN8nUrls: (urls: { load: string; actions: string }) => void;
  user: User | null;
  onUpdateGeminiKey: (apiKey: string) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
  isSaving: boolean;
}

const Settings: React.FC<SettingsProps> = ({ config, onUpdate, n8nUrls, onUpdateN8nUrls, user, onUpdateGeminiKey, showToast, isSaving }) => {
  // State for agent settings
  const [waitTime, setWaitTime] = useState(config.waitTime);
  const [notificationTrigger, setNotificationTrigger] = useState(config.notificationTrigger);
  const [notificationNumbers, setNotificationNumbers] = useState(config.notificationNumbers);
  
  // State for N8N URL settings
  const [loadUrl, setLoadUrl] = useState(n8nUrls.load);
  const [actionsUrl, setActionsUrl] = useState(n8nUrls.actions);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
  
  const handleLoginAndSetup = async () => {
    setIsLoggingIn(true);
    try {
        const signedInUser = await (window as any).aistudio.auth.signIn();
        if (signedInUser) {
            showToast('Login bem-sucedido! Gerando e atualizando a chave de API do Gemini...', 'success');
            
            const apiKey = await (window as any).aistudio.keys.create('gemini');
            if (apiKey) {
                await onUpdateGeminiKey(apiKey);
            } else {
                showToast('Falha ao gerar a chave de API do Gemini.', 'error');
            }
        }
    } catch (error) {
        console.error("Erro durante o login e configuração da chave:", error);
        showToast('Ocorreu um erro durante o login ou configuração da chave.', 'error');
    } finally {
        setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    (window as any).aistudio.auth.signOut();
  };

  const handleGenerateKey = async () => {
    setIsGeneratingKey(true);
    try {
        const apiKey = await (window as any).aistudio.keys.create('gemini');
        if (apiKey) {
            await onUpdateGeminiKey(apiKey);
        } else {
            showToast('Falha ao gerar a chave de API do Gemini.', 'error');
        }
    } catch (error) {
        console.error("Error generating Gemini API key:", error);
        showToast('Ocorreu um erro ao gerar a chave de API.', 'error');
    } finally {
        setIsGeneratingKey(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* AI Studio Connection Section */}
          <div className="p-6 bg-surface-bright rounded-lg border border-primary/30 space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Conexão com AI Studio</h3>
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <img src={user.photoUrl} alt={user.name} className="w-16 h-16 rounded-full"/>
                    <div>
                        <p className="font-semibold text-text-primary">{user.name}</p>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                    <button
                        onClick={handleGenerateKey}
                        disabled={isGeneratingKey || isSaving}
                        className="px-6 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-opacity-80 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isGeneratingKey ? 'Gerando...' : 'Gerar Nova Chave Gemini'}
                    </button>
                     <button
                        onClick={handleLogout}
                        className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-surface hover:bg-opacity-80 transition duration-200"
                      >
                        Logout
                      </button>
                </div>
                 <p className="text-xs text-text-secondary pt-2">
                    A chave de API do Gemini é usada pelos seus agentes no N8N. Ao gerar uma nova chave, ela será enviada e salva automaticamente na sua configuração do N8N.
                 </p>
                 {config.geminiApiKey ? (
                    <p className="text-xs text-success bg-success/10 p-2 rounded-md">Chave de API do Gemini configurada com sucesso!</p>
                 ) : (
                    <p className="text-xs text-warning bg-warning/10 p-2 rounded-md">A chave de API do Gemini ainda não foi configurada. Gere uma nova chave.</p>
                 )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-text-secondary mb-4">
                  Conecte sua conta Google através do AI Studio para gerar e configurar automaticamente sua API Key do Gemini.
                </p>
                <button
                    onClick={handleLoginAndSetup}
                    disabled={isLoggingIn}
                    className="px-8 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-opacity-80 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isLoggingIn ? 'Conectando e Configurando...' : 'Login com Google e Configurar Chave'}
                </button>
              </div>
            )}
          </div>
          {/* N8N Connection Section */}
          <div className="p-4 bg-surface-bright rounded-lg border border-surface-bright space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Conexão N8N (Opcional)</h3>
            <p className="text-sm text-text-secondary">
              Se você não estiver usando a integração com AI Studio, pode configurar as URLs dos webhooks do N8N manualmente.
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
        </div>
        {/* Right Column */}
        <div className="space-y-8">
            {/* Debug Mode Section */}
            <div className="p-6 bg-surface-bright rounded-lg border border-surface-bright space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Modo de Depuração</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-secondary">
                            Ative para registrar informações detalhadas sobre as operações dos agentes.
                        </p>
                        <p className="text-xs text-text-secondary/70">
                            Isso pode ajudar a diagnosticar problemas, mas pode consumir mais recursos do banco de dados.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onUpdate({ debug_mode: !config.debug_mode })}>
                        <div className={`relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in`}>
                            <input type="checkbox" checked={config.debug_mode} readOnly className={`toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer ${config.debug_mode ? 'right-0 border-success' : 'left-0 border-gray-400'}`}/>
                            <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${config.debug_mode ? 'bg-success' : 'bg-gray-400'}`}></label>
                        </div>
                    </div>
                </div>
                 <span className={`font-semibold text-sm ${config.debug_mode ? 'text-success' : 'text-text-secondary'}`}>{config.debug_mode ? 'Ativado' : 'Desativado'}</span>
            </div>
            {/* Agent Settings Section */}
            <div className="p-6 bg-surface-bright rounded-lg border border-surface-bright space-y-6">
                <h3 className="text-lg font-semibold text-text-primary">Configurações Gerais do Agente</h3>
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
                    disabled={isSaving}
                    className="px-8 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-opacity-80 transition duration-200 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                      <>
                        <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : 'Salvar Configurações do Agente'}
                </button>
                </div>
            </div>
        </div>
      </div>
      <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #4CAF50;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #4CAF50;
        }
      `}</style>
    </div>
  );
};

export default Settings;