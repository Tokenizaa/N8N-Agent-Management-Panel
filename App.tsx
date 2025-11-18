import React, { useState, useCallback, useEffect } from 'react';
import { View, AgentConfig, FollowUpCadence, InstanceState, DashboardData, ToastMessage, Agent, User, LogEntry, ModalState } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Agents from './components/Agents';
import Settings from './components/Settings';
import FollowUp from './components/FollowUp';
import Instance from './components/Instance';
import Toast from './components/Toast';
import Logs from './components/Logs';
import Modal from './components/Modal';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dashboardRange, setDashboardRange] = useState('7d');
  
  const [n8nUrls, setN8nUrls] = useState({ load: '', actions: '' });
  const [showUrlWarning, setShowUrlWarning] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    waitTime: 10,
    notificationTrigger: "",
    notificationNumbers: "",
    is_active: true,
    geminiApiKey: "",
    debug_mode: false,
  });

  const [followUpCadences, setFollowUpCadences] = useState<FollowUpCadence[]>([]);
  
  const [instanceState, setInstanceState] = useState<InstanceState>({
    instanceName: 'agente-01',
    isWhatsAppConnected: false,
  });
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    kpis: {
      totalLeads: 0,
      totalCompras: 0,
      totalFaturado: 0,
      ticketMedio: 0,
      taxaConversao: 0
    },
    leadsPorDia: []
  });

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirmationModal = (config: Omit<ModalState, 'isOpen' | 'onConfirm'> & { onConfirm: () => Promise<void> | void }) => {
    setModalState({ ...config, isOpen: true });
  };
  
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Mock AI Studio SDK for demonstration
    if (typeof (window as any).aistudio === 'undefined') {
      (window as any).aistudio = {};
    }
    if (typeof (window as any).aistudio.auth === 'undefined') {
      const mockUser = {
        name: 'Usuário Exemplo',
        email: 'usuario@exemplo.com',
        photoUrl: `https://ui-avatars.com/api/?name=Usuário+Exemplo&background=E53935&color=fff`,
      };
      let signedIn = JSON.parse(localStorage.getItem('aistudio_signedin') || 'false');
      let authCallback: ((user: any | null) => void) | null = null;

      (window as any).aistudio.auth = {
        onAuthStateChanged: (callback: (user: User | null) => void) => {
          authCallback = callback;
          callback(signedIn ? mockUser : null);
          return () => { authCallback = null; };
        },
        signIn: async () => {
          signedIn = true;
          localStorage.setItem('aistudio_signedin', 'true');
          if (authCallback) authCallback(mockUser);
          return mockUser;
        },
        signOut: async () => {
          signedIn = false;
          localStorage.setItem('aistudio_signedin', 'false');
          if (authCallback) authCallback(null);
        }
      };
    }
     if (typeof (window as any).aistudio.keys === 'undefined') {
        (window as any).aistudio.keys = {
            create: async (type: string) => {
                if (type === 'gemini') {
                    return `mock-gemini-api-key-${Date.now()}`;
                }
                return null;
            }
        }
    }

    const unsubscribe = (window as any).aistudio.auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedLoadUrl = localStorage.getItem('n8nLoadUrl') || '';
    const savedActionsUrl = localStorage.getItem('n8nActionsUrl') || '';
    setN8nUrls({ load: savedLoadUrl, actions: savedActionsUrl });

    if (!savedLoadUrl || !savedActionsUrl) {
      setShowUrlWarning(true);
      setView('settings'); // Redirect to settings if URLs are not configured
      setIsLoading(false);
    }
  }, []);

  const handleUpdateN8nUrls = (urls: { load: string; actions: string }) => {
    localStorage.setItem('n8nLoadUrl', urls.load);
    localStorage.setItem('n8nActionsUrl', urls.actions);
    setN8nUrls(urls);
    setShowUrlWarning(!urls.load || !urls.actions);
    showToast('URLs N8N salvas com sucesso! A página será recarregada.');
    setTimeout(() => window.location.reload(), 1500);
  };

  const fetchData = useCallback(async (range: string, isInitialLoad: boolean = false) => {
    if (!n8nUrls.load) {
      if (isInitialLoad) setIsLoading(false);
      return;
    }
    
    if (isInitialLoad) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      console.log(`Fetching data from N8N for range: ${range}...`);
      const response = await fetch(`${n8nUrls.load}?range=${range}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if(data.agentConfig) setAgentConfig(data.agentConfig);
      if(data.agents) setAgents(data.agents);
      if(data.followUpCadences) setFollowUpCadences(data.followUpCadences);
      if(data.dashboardData) setDashboardData(data.dashboardData);
      if(data.logs) setLogs(data.logs);
      if(data.isWhatsAppConnected !== undefined) {
          setInstanceState(prev => ({ ...prev, isWhatsAppConnected: data.isWhatsAppConnected }));
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast('Falha ao carregar dados do painel. Verifique a URL do N8N.', 'error');
    } finally {
      if (isInitialLoad) setIsLoading(false);
      else setIsRefreshing(false);
    }
  }, [n8nUrls.load]);

  // Initial data load
  useEffect(() => {
    if (n8nUrls.load) {
      fetchData(dashboardRange, true);
    }
  }, [fetchData, n8nUrls.load]);

  // Effect for polling dashboard data
  useEffect(() => {
    let intervalId: number | undefined;
    if (view === 'dashboard' && n8nUrls.load) {
      console.log('Dashboard active, starting polling every 10 seconds.');
      intervalId = window.setInterval(() => {
        fetchData(dashboardRange, false);
      }, 10000);
    }
    return () => {
      if (intervalId) {
        console.log('Cleaning up polling interval.');
        clearInterval(intervalId);
      }
    };
  }, [view, dashboardRange, fetchData, n8nUrls.load]);
  
  const handleDashboardRangeChange = (newRange: string) => {
    setDashboardRange(newRange);
    fetchData(newRange, false);
  };
  
  const handleUpdateAgentConfig = useCallback(async (newConfig: Partial<AgentConfig>) => {
    if (!n8nUrls.actions) {
        showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
        return;
    }
    const action = 'update_settings';
    setIsSaving(true);
    try {
      const response = await fetch(n8nUrls.actions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: newConfig }),
      });
      if (!response.ok) throw new Error('Failed to update config');
      
      setAgentConfig(prev => ({ ...prev, ...newConfig }));
      showToast('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating agent config:', error);
      showToast('Erro ao atualizar configurações.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [n8nUrls.actions]);
  
  const handleUpdateGeminiKey = useCallback(async (apiKey: string): Promise<void> => {
    if (!n8nUrls.actions) {
        showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
        return;
    }
     setIsSaving(true);
     try {
      const response = await fetch(n8nUrls.actions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_gemini_key', data: { apiKey } }),
      });
      if (!response.ok) throw new Error('Failed to update Gemini API Key');
      
      setAgentConfig(prev => ({...prev, geminiApiKey: apiKey }));
      showToast('Chave de API do Gemini atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating Gemini Key:', error);
      showToast('Erro ao atualizar a chave de API do Gemini.', 'error');
    } finally {
        setIsSaving(false);
    }
  }, [n8nUrls.actions]);

  const handleUpdateAgents = useCallback(async (agentsToUpdate: Agent[], agentsToDelete: number[]) => {
     if (!n8nUrls.actions) {
        showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
        return;
    }
     setIsSaving(true);
     try {
      const response = await fetch(n8nUrls.actions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_agents', data: { updated: agentsToUpdate, deleted: agentsToDelete } }),
      });
      if (!response.ok) throw new Error('Failed to update agents');
      
      setAgents(agentsToUpdate.filter(a => a.id >= 0));
      showToast('Agentes atualizados com sucesso!');
    } catch (error) {
      console.error('Error updating agents:', error);
      showToast('Erro ao atualizar agentes.', 'error');
    } finally {
        setIsSaving(false);
    }
  }, [n8nUrls.actions]);

  const handleResetMemory = useCallback(async () => {
    showConfirmationModal({
      title: 'Resetar Memória Global?',
      message: 'Esta ação apagará todo o histórico de conversas de todos os agentes. É uma ação irreversível. Deseja continuar?',
      confirmText: 'Sim, Resetar Tudo',
      isDanger: true,
      onConfirm: async () => {
        if (!n8nUrls.actions) {
          showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
          return;
        }
        try {
          await fetch(n8nUrls.actions, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset_memory' }),
          });
          showToast('Memória global resetada!', 'success');
        } catch (error) {
          console.error('Error resetting memory:', error);
          showToast('Erro ao resetar memória.', 'error');
        }
      }
    });
  }, [n8nUrls.actions]);

    const handleResetMemoryForLead = useCallback(async (leadId: string) => {
    showConfirmationModal({
      title: `Resetar Memória do Lead ${leadId}?`,
      message: 'Esta ação apagará o histórico de conversa apenas para este lead específico. Deseja continuar?',
      confirmText: 'Sim, Resetar',
      isDanger: true,
      onConfirm: async () => {
        if (!n8nUrls.actions) {
          showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
          return;
        }
        try {
          await fetch(n8nUrls.actions, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset_memory_for_lead', data: { leadId } }),
          });
          showToast(`Memória do lead ${leadId} resetada!`, 'success');
        } catch (error) {
          console.error('Error resetting memory for lead:', error);
          showToast('Erro ao resetar memória do lead.', 'error');
        }
      }
    });
  }, [n8nUrls.actions]);

  const handleClearLogs = useCallback(async () => {
    showConfirmationModal({
        title: 'Limpar Todos os Logs?',
        message: 'Esta ação é irreversível e removerá todos os registros de logs do sistema. Deseja continuar?',
        confirmText: 'Sim, Limpar Logs',
        isDanger: true,
        onConfirm: async () => {
            if (!n8nUrls.actions) {
                showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
                return;
            }
            try {
                const response = await fetch(n8nUrls.actions, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'clear_logs' }),
                });
                if (!response.ok) throw new Error('Failed to clear logs');
                setLogs([]);
                showToast('Logs limpos com sucesso!');
            } catch (error) {
                console.error('Error clearing logs:', error);
                showToast('Erro ao limpar os logs.', 'error');
            }
        }
    });
  }, [n8nUrls.actions]);
  
  const handleToggleFlow = useCallback(async () => {
    if (!n8nUrls.actions) {
        showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
        return;
    }
    const newStatus = !agentConfig.is_active;
    try {
        await fetch(n8nUrls.actions, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle_flow_status', data: { is_active: newStatus } }),
        });
        setAgentConfig(prev => ({ ...prev, is_active: newStatus }));
        showToast(`Agente ${newStatus ? 'ativado' : 'desativado'} com sucesso.`);
    } catch (error) {
        console.error('Error toggling flow status:', error);
        showToast('Erro ao alterar status do agente.', 'error');
    }
  }, [n8nUrls.actions, agentConfig.is_active]);

  const handleUpdateCadences = useCallback(async (newCadences: FollowUpCadence[]) => {
    if (!n8nUrls.actions) {
        showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
        return;
    }
    setIsSaving(true);
    try {
        const response = await fetch(n8nUrls.actions, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_followup', data: newCadences }),
        });
        if (!response.ok) throw new Error('Failed to update cadences');
        
        setFollowUpCadences(newCadences);
        showToast('Follow-up atualizado com sucesso!');
    } catch(error) {
        console.error('Error updating cadences:', error);
        showToast('Erro ao atualizar follow-up.', 'error');
    } finally {
        setIsSaving(false);
    }
  }, [n8nUrls.actions]);
  
  const handleGenerateQRCode = useCallback(async (instanceName: string): Promise<string> => {
    if (!n8nUrls.actions) {
        showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
        return '';
    }
    console.log(`POST to N8N Webhook: Generating QR for instance - ${instanceName}`);
    try {
      const response = await fetch(n8nUrls.actions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_qr', data: { instanceName } }),
      });
      if (!response.ok) throw new Error('Failed to generate QR code');
      const result = await response.json();
      
      if (result.qrCodeUrl) {
        return result.qrCodeUrl;
      } else if (result.qrCodeBase64) {
        return `data:image/png;base64,${result.qrCodeBase64}`;
      }
      
      return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(instanceName)}`;

    } catch(error) {
      console.error("Error generating QR code:", error);
      showToast('Falha ao gerar QR code.', 'error');
      return '';
    }
  }, [n8nUrls.actions]);
  
  const handleCheckStatus = useCallback(async () => {
    if (!n8nUrls.actions) {
        showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
        return;
    }
    console.log('POST to N8N Webhook: Checking instance status');
    try {
        const response = await fetch(n8nUrls.actions, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'check_status' }),
        });
        if (!response.ok) throw new Error('Failed to check status');
        const result = await response.json();
        setInstanceState(prev => ({ ...prev, isWhatsAppConnected: result.connected }));
    } catch (error) {
        console.error('Error checking status:', error);
        showToast('Erro ao verificar status da conexão.', 'error');
        setInstanceState(prev => ({ ...prev, isWhatsAppConnected: false }));
    }
  }, [n8nUrls.actions]);

  const handleDisconnectInstance = useCallback(async () => {
    if (!n8nUrls.actions) {
        showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
        return;
    }
    try {
        const response = await fetch(n8nUrls.actions, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'disconnect_instance' }),
        });
        if (!response.ok) throw new Error('Failed to disconnect');
        setInstanceState(prev => ({ ...prev, isWhatsAppConnected: false }));
        showToast('Instância desconectada com sucesso.');
    } catch (error) {
        console.error('Error disconnecting instance:', error);
        showToast('Erro ao desconectar instância.', 'error');
        setInstanceState(prev => ({ ...prev, isWhatsAppConnected: false }));
    }
  }, [n8nUrls.actions]);

  const handleCheckNumberOnWhatsApp = useCallback(async (number: string): Promise<{ onWhatsApp: boolean; number: string } | null> => {
    if (!n8nUrls.actions) {
        showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
        return null;
    }
    try {
        const response = await fetch(n8nUrls.actions, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'check_on_whatsapp', data: { number } }),
        });
        if (!response.ok) throw new Error('Failed to check number');
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error checking number:', error);
        showToast('Erro ao verificar número.', 'error');
        return null;
    }
  }, [n8nUrls.actions]);


  const renderView = () => {
    if (isLoading && !user) { // Also wait for user auth check
      return <div className="text-center p-10 text-text-secondary">Carregando dados...</div>;
    }
    
    const dashboardComponent = (
        <Dashboard 
            data={dashboardData} 
            onRefresh={() => fetchData(dashboardRange, false)} 
            isRefreshing={isRefreshing}
            range={dashboardRange}
            onRangeChange={handleDashboardRangeChange}
        />
    );

    switch(view) {
      case 'agents':
        return <Agents 
                    agents={agents} 
                    onUpdate={handleUpdateAgents} 
                    onResetMemory={handleResetMemory} 
                    onResetMemoryForLead={handleResetMemoryForLead}
                    isSaving={isSaving}
                    showConfirmationModal={showConfirmationModal}
                />;
      case 'settings':
        return <Settings 
                    config={agentConfig} 
                    onUpdate={handleUpdateAgentConfig} 
                    n8nUrls={n8nUrls}
                    onUpdateN8nUrls={handleUpdateN8nUrls}
                    user={user}
                    onUpdateGeminiKey={handleUpdateGeminiKey}
                    showToast={showToast}
                    isSaving={isSaving}
                />;
      case 'follow-up':
        return <FollowUp cadences={followUpCadences} onUpdate={handleUpdateCadences} isSaving={isSaving} />;
      case 'instance':
        return <Instance 
                    instanceState={instanceState} 
                    onGenerateQRCode={handleGenerateQRCode} 
                    onCheckStatus={handleCheckStatus} 
                    onDisconnect={handleDisconnectInstance}
                    onCheckNumber={handleCheckNumberOnWhatsApp}
                />;
      case 'logs':
        return <Logs logs={logs} agents={agents} onClearLogs={handleClearLogs} isLoading={isLoading}/>;
      case 'dashboard':
        return dashboardComponent;
      default:
        return dashboardComponent;
    }
  };
  
  const navItems = [
      { view: 'dashboard' as View, label: 'Dashboard' },
      { view: 'agents' as View, label: 'Agentes' },
      { view: 'settings' as View, label: 'Configurações' },
      { view: 'follow-up' as View, label: 'Follow-up' },
      { view: 'instance' as View, label: 'Instância' },
      { view: 'logs' as View, label: 'Logs' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans p-4 sm:p-6 lg:p-8">
      <Modal 
        {...modalState}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-7xl mx-auto bg-surface rounded-lg shadow-xl overflow-hidden">
        {showUrlWarning && !user && (
          <div className="bg-warning/20 text-warning text-center p-3 text-sm border-b-2 border-warning">
            <strong>Atenção:</strong> As URLs de Webhook do N8N não estão configuradas. Por favor, vá para a aba <strong>'Configurações'</strong> para adicioná-las.
          </div>
        )}
        <Header 
          workflowName="Orquestrador de Agentes IA"
          isFlowActive={agentConfig.is_active}
          onToggleFlow={handleToggleFlow}
          isWhatsAppConnected={instanceState.isWhatsAppConnected}
          user={user}
          onNavigateToSettings={() => setView('settings')}
        />
        <nav className="border-b border-surface-bright px-4">
          <div className="flex items-center space-x-4">
            {navItems.map(item => (
              <NavItem key={item.view} view={item.view} label={item.label} currentView={view} setView={setView} />
            ))}
          </div>
        </nav>
        <main className="p-4 sm:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ view: View; currentView: View; setView: (view: View) => void; label: string; }> = ({ view, currentView, setView, label }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => setView(view)}
      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'text-primary border-b-2 border-primary'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  );
};

export default App;