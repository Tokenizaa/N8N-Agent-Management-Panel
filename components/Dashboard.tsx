import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '../types';

interface KpiCardProps {
  title: string;
  value: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => (
  <div className="bg-surface-bright rounded-lg p-4 text-center border border-surface-bright">
    <p className="text-sm text-text-secondary">{title}</p>
    <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
  </div>
);

interface DashboardProps {
    data: DashboardData;
    onRefresh: () => void;
    isRefreshing: boolean;
    range: string;
    onRangeChange: (newRange: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onRefresh, isRefreshing, range, onRangeChange }) => {
  const { kpis, leadsPorDia } = data;
  
  const handleRefresh = () => {
      onRefresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-white">Dashboard de Leads</h2>
          {isRefreshing && (
            <div className="w-3 h-3" title="Atualizando dados...">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
            <select 
                value={range}
                onChange={(e) => onRangeChange(e.target.value)}
                className="bg-surface-bright border border-surface-bright rounded-md px-3 py-2 text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="this_month">Este Mês</option>
            </select>
            <button 
                onClick={handleRefresh}
                className="px-6 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-opacity-80 transition duration-200"
            >
                Gerar Dashboard
            </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-secondary mb-4">Métricas Principais</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard title="Total de Leads" value={kpis.totalLeads.toString()} />
          <KpiCard title="Total de Compras" value={kpis.totalCompras.toString()} />
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