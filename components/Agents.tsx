import React, { useState, useEffect, useRef } from 'react';
import { Agent } from '../types';
import { TrashIcon, BotIcon, PhoneIcon, BriefcaseIcon, SalesIcon, ChevronDownIcon, OrchestratorIcon, DragHandleIcon, CloneIcon } from './icons/Icons';

interface AgentsProps {
  agents: Agent[];
  onUpdate: (agentsToUpdate: Agent[], agentsToDelete: number[]) => void;
  onResetMemory: () => void;
  isSaving: boolean;
}

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onConfirm, title, message, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background bg-opacity-80 flex justify-center items-center z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-surface rounded-lg shadow-xl w-full max-w-md border border-surface-bright m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <p className="text-sm text-text-secondary mt-2">{message}</p>
        </div>
        <div className="flex justify-end items-center p-4 bg-surface-bright rounded-b-lg space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:bg-surface transition-colors">Cancelar</button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-danger hover:bg-opacity-80 transition-colors disabled:bg-danger/50"
          >
            {isLoading ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};


const AgentStatusIndicator: React.FC<{ status?: 'online' | 'busy' | 'offline' }> = ({ status }) => {
  const statusConfig = {
    online: { text: 'Online', dotClass: 'bg-success', textClass: 'text-success' },
    busy: { text: 'Ocupado', dotClass: 'bg-warning', textClass: 'text-warning' },
    offline: { text: 'Offline', dotClass: 'bg-danger', textClass: 'text-danger' },
  };

  const config = statusConfig[status || 'offline'];

  return (
    <div className="flex items-center" title={`Status: ${config.text}`}>
      <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-opacity-20 ${config.dotClass}/20 ${config.textClass}`}>
        <span className={`h-2 w-2 rounded-full mr-2 ${config.dotClass}`}></span>
        {config.text}
      </div>
    </div>
  );
};


const Agents: React.FC<AgentsProps> = ({ agents: initialAgents, onUpdate, onResetMemory, isSaving }) => {
  const [localAgents, setLocalAgents] = useState<Agent[]>([]);
  const [deletedAgentIds, setDeletedAgentIds] = useState<number[]>([]);
  const textareasRef = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  const [modalState, setModalState] = useState<{type: 'delete' | 'reset' | null, agentId?: number}>({ type: null });

  // Drag and Drop state
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  
  useEffect(() => {
    const sorted = [...initialAgents].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    setLocalAgents(sorted.map(a => ({ ...a, available_tools: a.available_tools || [], enable_follow_up: a.enable_follow_up ?? false })));
  }, [initialAgents]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAgentChange = (id: number, field: keyof Agent, value: any) => {
    setLocalAgents(prev =>
      prev.map(agent => (agent.id === id ? { ...agent, [field]: value } : agent))
    );
  };
  
  const handleSetDefault = (id: number) => {
      setLocalAgents(prev => 
        prev.map(agent => ({ ...agent, is_default: agent.id === id }))
      );
  };

  const handleAddAgent = () => {
    const newAgent: Agent = {
      id: Date.now() * -1, // Negative ID for new, unsaved agents
      name: 'Novo Agente',
      description: 'Breve descrição da função e objetivo deste agente.',
      prompt: 'Defina o prompt para este agente...',
      is_default: localAgents.length === 0,
      is_active: true,
      available_tools: [],
      sort_order: localAgents.length,
      enable_follow_up: false,
      status: 'offline',
    };
    setLocalAgents(prev => [...prev, newAgent]);
  };

  const confirmRemoveAgent = (id: number) => {
    if (id > 0) { 
      setDeletedAgentIds(prev => [...prev, id]);
    }
    setLocalAgents(prev => prev.filter(agent => agent.id !== id));
    setModalState({ type: null });
  };

  const handleSaveChanges = () => {
    if (localAgents.some(agent => agent.name.trim() === '')) {
      alert('O nome do agente não pode estar vazio.');
      return;
    }
    const defaultAgentCount = localAgents.filter(agent => agent.is_default).length;
    if (defaultAgentCount === 0 && localAgents.length > 0) {
        alert('Você deve definir um agente como padrão (orquestrador).');
        return;
    }
    if (defaultAgentCount > 1) {
        alert('Apenas um agente pode ser definido como padrão (orquestrador).');
        return;
    }
    
    const agentsWithOrder = localAgents.map((agent, index) => ({
      ...agent,
      sort_order: index,
    }));

    onUpdate(agentsWithOrder, deletedAgentIds);
    setDeletedAgentIds([]);
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItemIndex.current = index;
    setDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
     if (dragItemIndex.current === null || dragItemIndex.current === index) return;
     dragOverItemIndex.current = index;
     const list = [...localAgents];
     const draggedItemContent = list.splice(dragItemIndex.current, 1)[0];
     list.splice(dragOverItemIndex.current, 0, draggedItemContent);
     dragItemIndex.current = dragOverItemIndex.current;
     setLocalAgents(list);
  };

  const handleDragEnd = () => {
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
    setDragging(false);
  };
  
  const handleCloneAgent = (agentToClone: Agent) => {
    const newAgent: Agent = {
      ...agentToClone,
      id: Date.now() * -1,
      name: `Cópia de ${agentToClone.name}`,
      is_default: false,
      sort_order: localAgents.length,
    };
    setLocalAgents(prev => [...prev, newAgent]);
  };


  const VARIABLES = [
    { name: 'Nome do Cliente', value: '{{customer_name}}', description: 'O nome do cliente/contato.' },
    { name: 'Nome do Agente', value: '{{agent_name}}', description: 'O nome do agente atual.' },
    { name: 'Data Atual', value: '{{current_date}}', description: 'A data de hoje (ex: 25/12/2024).' },
    { name: 'Hora Atual', value: '{{current_time}}', description: 'A hora atual (ex: 14:30).' },
  ];

  const handleInsertVariable = (agentId: number, variable: string) => {
    const textarea = textareasRef.current[agentId];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + variable + text.substring(end);
    
    handleAgentChange(agentId, 'prompt', newText);
    setOpenDropdown(null);

    setTimeout(() => {
      const newTextarea = textareasRef.current[agentId];
      if (newTextarea) {
        newTextarea.focus();
        newTextarea.selectionStart = newTextarea.selectionEnd = start + variable.length;
      }
    }, 0);
  };
  
    const getAgentIcon = (agent: Agent) => {
    if(agent.is_default) {
        return <OrchestratorIcon className="w-10 h-10" />;
    }
    const lowerName = agent.name.toLowerCase();
    if (lowerName.includes('voz') || lowerName.includes('voice') || lowerName.includes('call')) {
      return <PhoneIcon className="w-10 h-10" />;
    }
    if (lowerName.includes('interno') || lowerName.includes('internal') || lowerName.includes('assistente')) {
      return <BriefcaseIcon className="w-10 h-10" />;
    }
    if (lowerName.includes('vendas') || lowerName.includes('sales')) {
      return <SalesIcon className="w-10 h-10" />;
    }
    return <BotIcon className="w-10 h-10" />;
  };

  const handleToolToggle = (orchestratorId: number, specialistId: number) => {
    setLocalAgents(prev => {
        return prev.map(agent => {
            if (agent.id === orchestratorId) {
                const tools = agent.available_tools || [];
                const newTools = tools.includes(specialistId)
                    ? tools.filter(id => id !== specialistId)
                    : [...tools, specialistId];
                return { ...agent, available_tools: newTools };
            }
            return agent;
        });
    });
  };

  return (
    <div className="space-y-8">
      <ConfirmationModal 
        isOpen={modalState.type === 'delete'}
        onClose={() => setModalState({ type: null })}
        onConfirm={() => confirmRemoveAgent(modalState.agentId!)}
        title="Confirmar Exclusão"
        message="Você tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita."
      />
      <ConfirmationModal 
        isOpen={modalState.type === 'reset'}
        onClose={() => setModalState({ type: null })}
        onConfirm={() => { onResetMemory(); setModalState({ type: null }); }}
        title="Confirmar Reset de Memória"
        message="Esta ação irá apagar TODO o histórico de conversas de TODOS os agentes. Os agentes perderão completamente o contexto sobre interações passadas. Você tem certeza?"
        isLoading={isSaving}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gerenciamento de Agentes</h2>
        <div className="flex items-center space-x-4">
           <button
             onClick={() => setModalState({ type: 'reset' })}
             className="px-6 py-2 rounded-lg font-semibold text-sm text-white bg-warning hover:bg-opacity-80 transition duration-200"
           >
             Resetar Memória Global
           </button>
           <button
              onClick={handleAddAgent}
              className="px-6 py-2 rounded-lg font-semibold text-sm text-white bg-success hover:bg-opacity-80 transition duration-200"
            >
              Adicionar Novo Agente
            </button>
        </div>
      </div>

      <div className="space-y-6">
        {localAgents.map((agent, index) => (
          <div key={agent.id} 
               draggable
               onDragStart={(e) => handleDragStart(e, index)}
               onDragEnter={(e) => handleDragEnter(e, index)}
               onDragEnd={handleDragEnd}
               onDragOver={(e) => e.preventDefault()}
               className={`bg-surface-bright rounded-lg border p-6 flex items-start space-x-4 transition-all duration-300 ${agent.is_default ? 'border-primary' : 'border-surface-bright'} ${!agent.is_active ? 'opacity-60' : ''} ${dragging && dragItemIndex.current === index ? 'opacity-50 scale-105 shadow-2xl' : ''}`}>
            
            <div className="flex-shrink-0 text-text-secondary cursor-move pt-2" title="Arraste para reordenar">
                <DragHandleIcon className="w-5 h-5" />
            </div>
            
            <div className="flex-shrink-0 text-primary pt-2">
              {getAgentIcon(agent)}
            </div>

            <div className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-grow">
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => handleAgentChange(agent.id, 'name', e.target.value)}
                    className="text-xl font-bold text-text-primary bg-transparent focus:outline-none w-full pb-1 border-b-2 border-transparent focus:border-primary transition-colors"
                    placeholder="Nome do Agente"
                  />
                  <textarea
                    value={agent.description}
                    onChange={(e) => handleAgentChange(agent.id, 'description', e.target.value)}
                    placeholder="Breve descrição da função e objetivo deste agente."
                    rows={2}
                    className="w-full text-sm text-text-secondary bg-transparent focus:outline-none mt-1 resize-y"
                  />
                </div>
                <div className="flex items-center space-x-4 flex-shrink-0 pl-4">
                   <button 
                      onClick={() => handleSetDefault(agent.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${agent.is_default ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:bg-primary/50'}`}>
                       {agent.is_default ? 'Padrão (Orquestrador)' : 'Definir como Padrão'}
                   </button>
                   <button onClick={() => handleCloneAgent(agent)} className="text-text-secondary hover:text-white p-1" title="Clonar Agente">
                    <CloneIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => setModalState({ type: 'delete', agentId: agent.id })} className="text-danger hover:text-red-400 p-1" title="Deletar Agente">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 mb-4 cursor-pointer" onClick={() => handleAgentChange(agent.id, 'is_active', !agent.is_active)}>
                    <div className={`relative inline-block w-8 mr-1 align-middle select-none transition duration-200 ease-in`}>
                        <input type="checkbox" name={`toggle-${agent.id}`} id={`toggle-${agent.id}`} checked={agent.is_active} readOnly className={`toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer ${agent.is_active ? 'right-0 border-success' : 'left-0 border-gray-400'}`}/>
                        <label htmlFor={`toggle-${agent.id}`} className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${agent.is_active ? 'bg-success' : 'bg-gray-400'}`}></label>
                    </div>
                    <span className={`text-xs font-semibold ${agent.is_active ? 'text-success' : 'text-text-secondary'}`}>{agent.is_active ? 'Ativo' : 'Inativo'}</span>
                </div>
                 <div className="flex items-center space-x-2 mb-4 cursor-pointer" onClick={() => handleAgentChange(agent.id, 'enable_follow_up', !agent.enable_follow_up)}>
                    <div className={`relative inline-block w-8 mr-1 align-middle select-none transition duration-200 ease-in`}>
                        <input type="checkbox" name={`followup-toggle-${agent.id}`} id={`followup-toggle-${agent.id}`} checked={agent.enable_follow_up} readOnly className={`toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer ${agent.enable_follow_up ? 'right-0 border-success' : 'left-0 border-gray-400'}`}/>
                        <label htmlFor={`followup-toggle-${agent.id}`} className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${agent.enable_follow_up ? 'bg-success' : 'bg-gray-400'}`}></label>
                    </div>
                    <span className={`text-xs font-semibold ${agent.enable_follow_up ? 'text-success' : 'text-text-secondary'}`}>Habilitar Follow-up</span>
                </div>
                <div className="mb-4">
                  <AgentStatusIndicator status={agent.status} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-text-primary">Prompt do Sistema</h4>
                    <div className="relative" ref={openDropdown === agent.id ? dropdownRef : null}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === agent.id ? null : agent.id)}
                          className="flex items-center space-x-2 px-4 py-1 text-xs font-semibold rounded-lg bg-surface hover:bg-primary/30 text-text-secondary transition-colors"
                          title="Inserir variável"
                        >
                          <span>Inserir Variável</span>
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                        {openDropdown === agent.id && (
                          <div className="absolute top-full right-0 mt-2 w-72 bg-surface rounded-lg shadow-lg z-10 border border-surface-bright">
                            <div className="p-2 text-xs text-text-secondary border-b border-surface">Variáveis Dinâmicas</div>
                            <ul className="py-1">
                              {VARIABLES.map(v => (
                                <li key={v.value} onClick={() => handleInsertVariable(agent.id, v.value)} className="px-3 py-2 hover:bg-primary/20 cursor-pointer">
                                  <p className="font-semibold text-text-primary text-sm flex justify-between items-center">
                                    <span>{v.name}</span>
                                    <code className="text-xs bg-background px-1.5 py-0.5 rounded">{v.value}</code>
                                  </p>
                                  <p className="text-xs text-text-secondary mt-1">{v.description}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                </div>
                 <textarea
                  ref={el => { if(el) textareasRef.current[agent.id] = el; }}
                  rows={8}
                  value={agent.prompt}
                  onChange={(e) => handleAgentChange(agent.id, 'prompt', e.target.value)}
                  className="w-full bg-background border border-surface rounded-lg p-4 text-text-secondary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 text-sm whitespace-pre-wrap"
                  placeholder="System Prompt do Agente..."
                />
              </div>

              {agent.is_default && (
                  <div className="mt-6 p-4 rounded-md bg-background border border-surface">
                    <h4 className="font-semibold text-text-primary mb-3">Ferramentas (Agentes Especialistas)</h4>
                    <p className="text-xs text-text-secondary mb-4">Selecione quais agentes especialistas o orquestrador pode acionar. As descrições destes agentes serão usadas no prompt.</p>
                    <div className="space-y-3">
                      {localAgents
                        .filter(a => !a.is_default && a.is_active)
                        .map(specialist => (
                          <label key={specialist.id} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded bg-surface border-surface-bright text-primary focus:ring-primary"
                              checked={agent.available_tools?.includes(specialist.id) ?? false}
                              onChange={() => handleToolToggle(agent.id, specialist.id)}
                            />
                            <span className="text-sm text-text-primary">{specialist.name}</span>
                          </label>
                        ))
                      }
                      {localAgents.filter(a => !a.is_default && a.is_active).length === 0 && (
                          <p className="text-sm text-text-secondary italic">Nenhum agente especialista ativo encontrado para ser usado como ferramenta.</p>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
         {localAgents.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-surface-bright rounded-lg">
                <p className="text-text-secondary">Nenhum agente configurado.</p>
                <p className="text-sm text-text-secondary/70">Clique em "Adicionar Novo Agente" para começar.</p>
            </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="px-8 py-3 rounded-lg font-semibold text-white bg-primary hover:bg-opacity-80 transition duration-200 disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvando...
            </>
          ) : 'Salvar Todas as Alterações'}
        </button>
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

export default Agents;