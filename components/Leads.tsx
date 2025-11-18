import React, { useState, useMemo } from 'react';
import { Lead, Agent } from '../types';
import LeadDetailPanel from './LeadDetailPanel';
import { MoodHappyIcon, MoodNeutralIcon, MoodSadIcon } from './icons/Icons';

interface LeadsProps {
    leads: Lead[];
    agents: Agent[];
}

const SentimentIndicator: React.FC<{ sentiment: Lead['sentiment'] }> = ({ sentiment }) => {
    const sentimentConfig = {
        positive: { Icon: MoodHappyIcon, color: 'text-success', label: 'Positivo' },
        neutral: { Icon: MoodNeutralIcon, color: 'text-text-secondary', label: 'Neutro' },
        negative: { Icon: MoodSadIcon, color: 'text-danger', label: 'Negativo' },
        unknown: { Icon: MoodNeutralIcon, color: 'text-text-secondary/50', label: 'Desconhecido' }
    };
    const { Icon, color, label } = sentimentConfig[sentiment];
    return <Icon className={`w-6 h-6 ${color}`} title={`Sentimento: ${label}`} />;
};

const statusColors: { [key: string]: string } = {
    'novo': 'bg-blue-500/20 text-blue-400',
    'qualificado': 'bg-yellow-500/20 text-yellow-400',
    'comprou': 'bg-success/20 text-success',
    'em-risco': 'bg-danger/20 text-danger',
};

const Leads: React.FC<LeadsProps> = ({ leads, agents }) => {
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.phone.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [leads, searchTerm, statusFilter]);
    
    const allStatuses = useMemo(() => [...new Set(leads.map(l => l.status))], [leads]);
    const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [leads, selectedLeadId]);
    
    return (
        <div className="space-y-6">
            <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLeadId(null)} />
            
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Gerenciamento de Leads</h2>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-surface-bright border border-surface-bright rounded-md px-3 py-2 text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary text-sm w-48"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-surface-bright border border-surface-bright rounded-md px-3 py-2 text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                        <option value="all">Todos os Status</option>
                        {allStatuses.map(status => (
                            <option key={status} value={status} className="capitalize">{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-surface-bright rounded-lg border border-surface-bright overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-primary uppercase bg-surface">
                            <tr>
                                <th scope="col" className="px-6 py-3">Lead</th>
                                <th scope="col" className="px-6 py-3">Último Contato</th>
                                <th scope="col" className="px-6 py-3">Último Agente</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Sentimento</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="bg-surface-bright border-b border-surface hover:bg-surface/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-text-primary">{lead.name}</div>
                                        <div className="text-xs font-mono">{lead.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">{new Date(lead.lastContact).toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4">{lead.lastAgent}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusColors[lead.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                            {lead.status.replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center">
                                        <SentimentIndicator sentiment={lead.sentiment} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelectedLeadId(lead.id)} className="font-medium text-primary hover:underline">Ver Detalhes</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             {filteredLeads.length === 0 && (
                <div className="text-center py-10 text-text-secondary">
                    <p>Nenhum lead encontrado com os filtros atuais.</p>
                </div>
            )}
        </div>
    );
};

export default Leads;