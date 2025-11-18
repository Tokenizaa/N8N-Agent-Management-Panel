import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, AgentConfig, FollowUpCadence, InstanceState, DashboardData, ToastMessage, Agent, Phase, Lead } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Agents from './components/Agents';
import Settings from './components/Settings';
import FollowUp from './components/FollowUp';
import Instance from './components/Instance';
import Toast from './components/Toast';
import Roadmap from './components/Roadmap';
import Leads from './components/Leads';
import { roadmapData } from './roadmapData';
import { mockLeads } from './mockData';


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
  const [phases, setPhases] = useState<Phase[]>(roadmapData);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);


  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    waitTime: 10,
    notificationTrigger: "",
    notificationNumbers: "",
    is_active: true,
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
    leadsPorDia: [],
    leadDetails: {
        compras: [],
        leads: [],
    }
  });
  
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

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
      if(data.leads) setLeads(data.leads);
      if(data.followUpCadences) setFollowUpCadences(data.followUpCadences);
      if(data.dashboardData) setDashboardData(data.dashboardData);
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
    console.log(`POST to N8N Webhook: ${action}`, newConfig);

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
    if (!n8nUrls.actions) {
        showToast('Por favor, configure a URL de Ações do N8N.', 'warning');
        return;
    }
    console.log('POST to N8N Webhook: Resetting Agent Memory');
    setIsSaving(true);
    try {
        await fetch(n8nUrls.actions, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset_memory' }),
        });
      showToast('Memória resetada!', 'success');
    } catch(error) {
       console.error('Error resetting memory:', error);
       showToast('Erro ao resetar memória.', 'error');
    } finally {
        setIsSaving(false);
    }
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
    console.log('POST to N8N Webhook: Updating Follow-up Cadences', newCadences);
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
        showToast(`Status da conexão: ${result.connected ? 'Conectado' : 'Desconectado'}`);
    } catch (error) {
        console.error('Error checking status:', error);
        showToast('Erro ao verificar status da conexão.', 'error');
        setInstanceState(prev => ({ ...prev, isWhatsAppConnected: false }));
    }
  }, [n8nUrls.actions]);

  // Roadmap handlers
  const handleTogglePhase = (phaseId: string) => {
    setPhases(
      phases.map(p =>
        p.id === phaseId ? { ...p, isExpanded: !p.isExpanded } : p
      )
    );
  };
  
  const handleToggleTask = (taskId: string) => {
    setPhases(phases.map(phase => ({
      ...phase,
      categories: phase.categories.map(category => ({
        ...category,
        tasks: category.tasks.map(task => {
          if (task.id === taskId) {
            const newCompleted = !task.completed;
            return {
              ...task,
              completed: newCompleted,
              subTasks: task.subTasks.map(sub => ({ ...sub, completed: newCompleted }))
            };
          }
          return task;
        })
      }))
    })));
  };

  const handleToggleSubTask = (subTaskId: string) => {
     setPhases(phases.map(phase => ({
      ...phase,
      categories: phase.categories.map(category => ({
        ...category,
        tasks: category.tasks.map(task => {
          const subTaskIndex = task.subTasks.findIndex(st => st.id === subTaskId);
          if (subTaskIndex > -1) {
            const newSubTasks = task.subTasks.map(sub => 
              sub.id === subTaskId ? { ...sub, completed: !sub.completed } : sub
            );
            const allSubTasksCompleted = newSubTasks.every(st => st.completed);
            return { ...task, subTasks: newSubTasks, completed: allSubTasksCompleted };
          }
          return task;
        })
      }))
    })));
  };
  
  const progress = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    phases.forEach(phase => {
        phase.categories.forEach(category => {
            category.tasks.forEach(task => {
                task.subTasks.forEach(() => {
                    totalTasks++;
                });
            });
        });
    });

    phases.forEach(phase => {
        phase.categories.forEach(category => {
            category.tasks.forEach(task => {
                task.subTasks.forEach(subTask => {
                    if (subTask.completed) {
                        completedTasks++;
                    }
                });
            });
        });
    });

    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }, [phases]);


  const renderView = () => {
    if (isLoading) {
      return <div className="text-center p-10 text-text-secondary">Carregando dados...</div>;
    }
    
    const dashboardComponent = (
        <Dashboard 
            data={dashboardData} 
            agents={agents}
            onRefresh={() => fetchData(dashboardRange, false)} 
            isRefreshing={isRefreshing}
            range={dashboardRange}
            onRangeChange={handleDashboardRangeChange}
        />
    );

    switch(view) {
      case 'agents':
        return <Agents agents={agents} onUpdate={handleUpdateAgents} onResetMemory={handleResetMemory} isSaving={isSaving} />;
      case 'leads':
        return <Leads leads={leads} agents={agents} />;
      case 'settings':
        return <Settings 
                    config={agentConfig} 
                    onUpdate={handleUpdateAgentConfig} 
                    n8nUrls={n8nUrls}
                    onUpdateN8nUrls={handleUpdateN8nUrls}
                />;
      case 'follow-up':
        return <FollowUp cadences={followUpCadences} onUpdate={handleUpdateCadences} isSaving={isSaving} />;
      case 'instance':
        return <Instance instanceState={instanceState} onGenerateQRCode={handleGenerateQRCode} onCheckStatus={handleCheckStatus} />;
      case 'roadmap':
        return <Roadmap
                    phases={phases}
                    progress={progress}
                    onTogglePhase={handleTogglePhase}
                    onToggleTask={handleToggleTask}
                    onToggleSubTask={handleToggleSubTask}
                />;
      case 'dashboard':
        return dashboardComponent;
      default:
        return dashboardComponent;
    }
  };
  
  const navItems = [
      { view: 'dashboard' as View, label: 'Dashboard' },
      { view: 'leads' as View, label: 'Leads' },
      { view: 'agents' as View, label: 'Agentes' },
      { view: 'roadmap' as View, label: 'Roadmap' },
      { view: 'follow-up' as View, label: 'Follow-up' },
      { view: 'instance' as View, label: 'Instância' },
      { view: 'settings' as View, label: 'Configurações' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans p-4 sm:p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-7xl mx-auto bg-surface rounded-lg shadow-xl overflow-hidden">
        {showUrlWarning && (
          <div className="bg-warning/20 text-warning text-center p-3 text-sm border-b-2 border-warning">
            <strong>Atenção:</strong> As URLs de Webhook do N8N não estão configuradas. Por favor, vá para a aba <strong>'Configurações'</strong> para adicioná-las.
          </div>
        )}
        <Header 
          workflowName="Orquestrador de Agentes IA"
          isFlowActive={agentConfig.is_active}
          onToggleFlow={handleToggleFlow}
          isWhatsAppConnected={instanceState.isWhatsAppConnected}
        />
        <nav className="border-b border-surface-bright px-4 overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-4 whitespace-nowrap">
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
      className={`px-3 py-3 text-sm font-medium transition-colors duration-200 ${
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