import React, { useState, useMemo, useEffect } from 'react';
import { LogEntry, Agent } from '../types';
import { ChevronDownIcon, BugAntIcon, TrashIcon } from './icons/Icons';

interface LogsProps {
  logs: LogEntry[];
  agents: Agent[];
  onClearLogs: () => void;
}

const LogItem: React.FC<{ log: LogEntry; isExpanded: boolean; onToggle: () => void; }> = ({ log, isExpanded, onToggle }) => {
    
    const levelClasses = {
        INFO: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        DEBUG: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        WARNING: 'bg-warning/20 text-warning border-warning/30',
        ERROR: 'bg-danger/20 text-danger border-danger/30',
    };
    
    const levelDotClasses = {
        INFO: 'bg-sky-400',
        DEBUG: 'bg-purple-400',
        WARNING: 'bg-warning',
        ERROR: 'bg-danger',
    }

    const formattedTimestamp = new Date(log.timestamp).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium'
    });
    
    const renderDetails = (details: any) => {
        if (typeof details === 'string') {
            try {
                // Try parsing if it's a JSON string
                const parsed = JSON.parse(details);
                return JSON.stringify(parsed, null, 2);
            } catch (e) {
                // If not a JSON string, return as is
                return details;
            }
        }
        return JSON.stringify(details, null, 2);
    };

    return (
        <div className="bg-surface-bright rounded-lg border border-surface-bright/50">
            <div className="flex items-center p-3 cursor-pointer" onClick={onToggle}>
                <div className="flex-shrink-0 w-24 text-xs text-text-secondary">{formattedTimestamp}</div>
                <div className={`flex-shrink-0 w-28 text-center px-2 py-0.5 rounded-full text-xs font-semibold ${levelClasses[log.level]}`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${levelDotClasses[log.level]}`}></span>
                    {log.level}
                </div>
                <div className="flex-shrink-0 w-48 ml-4 font-mono text-sm text-text-primary truncate" title={log.agent_name}>{log.agent_name}</div>
                <div className="flex-grow ml-4 text-sm text-text-secondary truncate" title={log.message}>{log.message}</div>
                <div className="flex-shrink-0 ml-4 text-text-secondary">
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} />
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-surface-bright/50 bg-background/50 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-text-secondary whitespace-pre-wrap break-all">
                        <code>{renderDetails(log.details)}</code>
                    </pre>
                </div>
            )}
        </div>
    );
};


const Logs: React.FC<LogsProps> = ({ logs, agents, onClearLogs }) => {
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const LOG_LEVELS: LogEntry['level'][] = ['INFO', 'DEBUG', 'WARNING', 'ERROR'];
  const [selectedLevels, setSelectedLevels] = useState<LogEntry['level'][]>(LOG_LEVELS);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const LOGS_PER_PAGE = 50;

  useEffect(() => {
      setCurrentPage(1);
  }, [filterAgent, searchQuery, selectedLevels]);

  const handleLevelChange = (level: LogEntry['level']) => {
    setSelectedLevels(prev => 
        prev.includes(level) 
            ? prev.filter(l => l !== level) 
            : [...prev, level]
    );
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Agent filter
      if (filterAgent !== 'all' && log.agent_name !== filterAgent) {
        return false;
      }
      // Level filter
      if (selectedLevels.length > 0 && !selectedLevels.includes(log.level)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const messageMatch = log.message.toLowerCase().includes(lowerCaseQuery);
        const detailsString = typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '');
        const detailsMatch = detailsString.toLowerCase().includes(lowerCaseQuery);
        if (!messageMatch && !detailsMatch) {
          return false;
        }
      }
      return true;
    });
  }, [logs, filterAgent, selectedLevels, searchQuery]);
  
  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
      return filteredLogs.slice(
          (currentPage - 1) * LOGS_PER_PAGE,
          currentPage * LOGS_PER_PAGE
      );
  }, [filteredLogs, currentPage]);

  const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const handleToggle = (id: number) => {
      setExpandedId(prevId => (prevId === id ? null : id));
  };

  const paginationButtonClasses = "px-4 py-2 rounded-lg font-semibold text-sm bg-surface-bright hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <BugAntIcon className="w-8 h-8 text-primary"/>
            <h2 className="text-2xl font-bold text-white">Logs de Depuração</h2>
        </div>
        <button 
            onClick={onClearLogs}
            className="flex items-center px-4 py-2 rounded-lg font-semibold text-sm text-white bg-danger hover:bg-opacity-80 transition duration-200"
        >
            <TrashIcon className="w-4 h-4 mr-2"/>
            Limpar Logs
        </button>
      </div>
      
      {/* Filter bar */}
      <div className="p-4 bg-surface-bright rounded-lg border border-surface-bright/50 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <div className="flex items-center space-x-4 flex-wrap gap-y-4">
            <div>
                <label className="text-xs text-text-secondary block mb-1">Agente</label>
                <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} className="bg-surface border border-surface-bright rounded-md px-3 py-2 text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="all">Todos os Agentes</option>
                    {agents.map(agent => (
                        <option key={agent.id} value={agent.name}>{agent.name}</option>
                    ))}
                    <option value="System">System</option>
                </select>
            </div>
             <div>
                <label className="text-xs text-text-secondary block mb-1">Busca Textual</label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por mensagem..."
                    className="bg-surface border border-surface-bright rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                />
            </div>
        </div>
        <div className="pt-4 md:pt-0">
            <label className="text-xs text-text-secondary block mb-2">Níveis</label>
            <div className="flex items-center space-x-4">
                {LOG_LEVELS.map(level => (
                    <label key={level} className="flex items-center space-x-2 cursor-pointer text-sm text-text-primary">
                        <input 
                            type="checkbox"
                            checked={selectedLevels.includes(level)}
                            onChange={() => handleLevelChange(level)}
                            className="h-4 w-4 rounded bg-surface border-surface-bright text-primary focus:ring-primary"
                        />
                        <span>{level}</span>
                    </label>
                ))}
            </div>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-lg border border-surface-bright space-y-2">
          {/* Header */}
          <div className="flex items-center p-3 text-xs text-text-secondary font-bold uppercase">
              <div className="w-24">Timestamp</div>
              <div className="w-28 text-center">Nível</div>
              <div className="w-48 ml-4">Agente</div>
              <div className="flex-grow ml-4">Mensagem</div>
              <div className="w-5 ml-4"></div>
          </div>
          {/* Logs List */}
          {paginatedLogs.length > 0 ? (
              paginatedLogs.map(log => (
                <LogItem 
                    key={log.id} 
                    log={log} 
                    isExpanded={expandedId === log.id}
                    onToggle={() => handleToggle(log.id)}
                />
              ))
          ) : (
            <div className="text-center py-10 text-text-secondary">
                Nenhum log encontrado para os filtros selecionados.
            </div>
          )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 text-sm text-text-secondary">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className={paginationButtonClasses}>
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages} ({filteredLogs.length} logs)</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className={paginationButtonClasses}>
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

export default Logs;
