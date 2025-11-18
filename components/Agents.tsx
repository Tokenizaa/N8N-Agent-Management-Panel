import React, { useState, useEffect, useRef } from 'react';
import { Agent, ModalState } from '../types';
import { TrashIcon, BotIcon, PhoneIcon, BriefcaseIcon, SalesIcon, ChevronDownIcon, OrchestratorIcon, DragHandleIcon, SpinnerIcon } from './icons/Icons';

interface AgentsProps {
  agents: Agent[];
  onUpdate: (agentsToUpdate: Agent[], agentsToDelete: number[]) => void;
  onResetMemory: () => void;
  onResetMemoryForLead: (leadId: string) => void;
  isSaving: boolean;
  showConfirmationModal: (config: Omit<ModalState, 'isOpen' | 'onConfirm'> & { onConfirm: () => void }) => void;
}

const Agents: React.FC<AgentsProps> = ({ agents: initialAgents, onUpdate, onResetMemory, onResetMemoryForLead, isSaving, showConfirmationModal }) => {
  const [localAgents, setLocalAgents] = useState<Agent[]>([]);
  const [deletedAgentIds, setDeletedAgentIds] = useState<number[]>([]);
  const textareasRef = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [granularLeadId, setGranularLeadId] = useState('');
  
  // Drag and Drop state
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  
  useEffect(() => {
    // Sort initial agents by their sort_order
    const sorted = [...initialAgents].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    setLocalAgents(sorted.map(a => ({ ...a, available_tools: a.available_tools || [] })));
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
    };
    setLocalAgents(prev => [...prev, newAgent]);
  };

  const handleRemoveAgent = (id: number) => {
    const agentToRemove = localAgents.find(agent => agent.id === id);
    if (!agentToRemove) return;

    showConfirmationModal({
        title: `Remover Agente "${agentToRemove.name}"?`,
        message: 'Esta ação removerá o agente da sua configuração. A remoção será efetivada ao salvar as alterações. Deseja continuar?',
        confirmText: 'Sim, Remover',
        isDanger: true,
        onConfirm: () => {
             if (id > 0) { // Only add existing agents to the delete list
                setDeletedAgentIds(prev => [...prev, id]);
            }
            setLocalAgents(prev => prev.filter(agent => agent.id !== id));
        }
    });
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
    
    // Add sort_order based on the current array index before saving
    const agentsWithOrder = localAgents.map((agent, index) => ({
      ...agent,
      sort_order: index,
    }));

    onUpdate(agentsWithOrder, deletedAgentIds);
    setDeletedAgentIds([]);
  };

  const handleGranularReset = () => {
      if (!granularLeadId.trim()) {
          alert('Por favor, insira o ID do lead (número de telefone).');
          return;
      }
      onResetMemoryForLead(granularLeadId.trim());
  }
  
    // Drag and Drop Handlers
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gerenciamento de Agentes</h2>
        <button
          onClick={handleAddAgent}
          className="px-6 py-2 rounded-lg font-semibold text-sm text-white bg-success hover:bg-opacity-80 transition duration-200"
        >
          Adicionar Novo Agente
        </button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-surface-bright rounded-lg border border-surface-bright/50">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Memória dos Agentes</h3>
            <p className="text-sm text-text-secondary mt-1">
              A memória (histórico de conversas) é usada para dar contexto aos agentes. Você pode resetá-la globalmente ou por lead específico para depuração.
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-surface rounded-lg">
                <label htmlFor="lead-id" className="block text-sm font-medium text-text-secondary mb-2">
                    Resetar Memória por Lead (ID/Telefone)
                </label>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        id="lead-id"
                        value={granularLeadId}
                        onChange={(e) => setGranularLeadId(e.target.value)}
                        placeholder="Ex: 5511999998888"
                        className="w-full bg-background border border-surface-bright rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                    />
                    <button
                        onClick={handleGranularReset}
                        className="px-4 py-2 rounded-lg font-semibold text-sm text-white bg-warning hover:bg-opacity-80 transition duration-200"
                    >
                        Resetar Lead
                    </button>
                </div>
            </div>
             <button
                 onClick={onResetMemory}
                 className="w-full px-6 py-2 rounded-lg font-semibold text-sm text-white bg-danger hover:bg-opacity-80 transition duration-200"
               >
                 Resetar Memória Global
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
                  <button onClick={() => handleRemoveAgent(agent.id)} className="text-danger hover:text-red-400 p-1">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4 cursor-pointer" onClick={() => handleAgentChange(agent.id, 'is_active', !agent.is_active)}>
                  <div className={`relative inline-block w-8 mr-1 align-middle select-none transition duration-200 ease-in`}>
                      <input type="checkbox" name={`toggle-${agent.id}`} id={`toggle-${agent.id}`} checked={agent.is_active} readOnly className={`toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer ${agent.is_active ? 'right-0 border-success' : 'left-0 border-gray-400'}`}/>
                      <label htmlFor={`toggle-${agent.id}`} className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${agent.is_active ? 'bg-success' : 'bg-gray-400'}`}></label>
                  </div>
                  <span className={`text-xs font-semibold ${agent.is_active ? 'text-success' : 'text-text-secondary'}`}>{agent.is_active ? 'Ativo' : 'Inativo'}</span>
              </div>
              
              <textarea
                ref={el => { if(el) textareasRef.current[agent.id] = el; }}
                rows={8}
                value={agent.prompt}
                onChange={(e) => handleAgentChange(agent.id, 'prompt', e.target.value)}
                className="w-full bg-background border border-surface rounded-lg p-4 text-text-secondary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 text-sm whitespace-pre-wrap"
                placeholder="System Prompt do Agente..."
              />
              <div className="mt-4 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === agent.id ? null : agent.id)}
                    className="px-4 py-2 bg-surface hover:bg-primary/30 text-text-secondary text-sm rounded-md border border-surface-bright transition-colors flex items-center"
                  >
                    Inserir Variável <ChevronDownIcon className="w-4 h-4 ml-2" />
                  </button>
                  {openDropdown === agent.id && (
                    <div className="absolute top-full mt-2 w-72 bg-surface-bright rounded-lg shadow-lg z-10 border border-surface">
                      <ul className="py-2">
                        {VARIABLES.map(v => (
                          <li key={v.value} onClick={() => handleInsertVariable(agent.id, v.value)} className="px-4 py-2 hover:bg-primary/20 cursor-pointer">
                            <p className="font-semibold text-text-primary">{v.name} - <code>{v.value}</code></p>
                            <p className="text-xs text-text-secondary">{v.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
          className="px-8 py-3 rounded-lg font-semibold text-white bg-primary hover:bg-opacity-80 transition duration-200 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
                <SpinnerIcon className="w-5 h-5 mr-2 animate-spin"/>
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