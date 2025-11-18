import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData, LeadDetail, Agent } from '../types';
import { DownloadIcon } from './icons/Icons';

const KpiDetailModal: React.FC<{isOpen: boolean, onClose: () => void, title: string, data: LeadDetail[]}> = ({ isOpen, onClose, title, data }) => {
    if (!isOpen) return null;

    return (
        <div 
          className="fixed inset-0 bg-background bg-opacity-80 flex justify-center items-center z-50"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
            <div 
                className="bg-surface rounded-lg shadow-xl w-full max-w-2xl border border-surface-bright m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-surface-bright">
                    <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl" aria-label="Fechar modal">&times;</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-primary uppercase bg-surface-bright">
                            <tr>
                                <th scope="col" className="px-4 py-3">ID</th>
                                <th scope="col" className="px-4 py-3">Nome</th>
                                <th scope="col" className="px-4 py-3">Agente</th>
                                <th scope="col" className="px-4 py-3">Data</th>
                                <th scope="col" className="px-4 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.id} className="bg-surface border-b border-surface-bright hover:bg-surface-bright/80">
                                    <td className="px-4 py-2 font-mono text-xs">{item.id}</td>
                                    <td className="px-4 py-2 font-medium text-text-primary">{item.name}</td>
                                    <td className="px-4 py-2">{item.agent}</td>
                                    <td className="px-4 py-2">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-4 py-2 text-right font-semibold">{item.value > 0 ? `R$ ${item.value.toFixed(2)}` : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const KpiCard: React.FC<{ title: string; value: string; onClick?: () => void; }> = ({ title, value, onClick }) => (
  <button 
    onClick={onClick}
    disabled={!onClick}
    className="bg-surface-bright rounded-lg p-4 text-center border border-surface-bright hover:border-primary disabled:hover:border-surface-bright transition-colors w-full"
  >
    <p className="text-sm text-text-secondary">{title}</p>
    <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
  </button>
);

interface DashboardProps {
    data: DashboardData;
    agents: Agent[];
    onRefresh: () => void;
    isRefreshing: boolean;
    range: string;
    onRangeChange: (newRange: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, agents, onRefresh, isRefreshing, range, onRangeChange }) => {
  const { kpis, leadsPorDia, leadDetails } = data;
  const [modalData, setModalData] = useState<{title: string, data: LeadDetail[] } | null>(null);

  const handleExportCSV = () => {
    const headers = "metrica,valor\n";
    const kpiCsv = Object.entries(kpis).map(([key, value]) => `${key},${value}`).join('\n');
    
    const chartHeaders = "\ndia,leads\n";
    const chartCsv = leadsPorDia.map(d => `${d.name},${d.leads}`).join('\n');

    const csvContent = "data:text/csv;charset=utf-8," + headers + kpiCsv + chartHeaders + chartCsv;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dashboard_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <KpiDetailModal 
        isOpen={!!modalData}
        onClose={() => setModalData(null)}
        title={modalData?.title || ''}
        data={modalData?.data || []}
      />
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-white">Dashboard de Performance</h2>
          {isRefreshing && (
            <div className="w-3 h-3" title="Atualizando dados...">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
            <select className="bg-surface-bright border border-surface-bright rounded-md px-3 py-2 text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                <option value="all">Todos os Agentes</option>
                {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
            </select>
            <select 
                value={range}
                onChange={(e) => onRangeChange(e.target.value)}
                className="bg-surface-bright border border-surface-bright rounded-md px-3 py-2 text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="this_month">Este Mês</option>
            </select>
            <button 
                onClick={handleExportCSV}
                className="p-2 rounded-lg font-semibold text-white bg-surface-bright hover:bg-opacity-80 transition duration-200"
                title="Exportar para CSV"
            >
                <DownloadIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-secondary mb-4">Métricas Principais</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard title="Total de Leads" value={kpis.totalLeads.toString()} onClick={() => setModalData({title: 'Detalhes de Leads', data: leadDetails?.leads || []})} />
          <KpiCard title="Total de Compras" value={kpis.totalCompras.toString()} onClick={() => setModalData({title: 'Detalhes de Compras', data: leadDetails?.compras || []})} />
          <KpiCard title="Total Faturado" value={`R$ ${kpis.totalFaturado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
          <KpiCard title="Ticket Médio" value={`R$ ${kpis.ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
          <KpiCard title="Taxa de Conversão" value={`${kpis.taxaConversao.toFixed(2)}%`} />
        </div>
      </div>

      <div className="bg-surface-bright rounded-lg p-6 border border-surface-bright">
        <h3 className="text-lg font-bold text-white mb-4">Leads por Dia</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={leadsPorDia} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
              <XAxis dataKey="name" stroke="#A3A3A3" />
              <YAxis stroke="#A3A3A3" />
              <Tooltip
                contentStyle={{ backgroundColor: '#101010', border: '1px solid #2C2C2C' }}
                labelStyle={{ color: '#F5F5F5' }}
              />
              <Legend />
              <Bar dataKey="leads" fill="#E53935" name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;