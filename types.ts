export type View = 'agents' | 'settings' | 'follow-up' | 'instance' | 'dashboard' | 'toast' | 'logs';

export interface Agent {
  id: number;
  name: string;
  description: string;
  prompt: string;
  is_default: boolean;
  is_active: boolean;
  available_tools?: number[];
  sort_order: number;
}

export interface AgentConfig {
  waitTime: number;
  notificationTrigger: string;
  notificationNumbers: string;
  is_active: boolean;
  geminiApiKey?: string;
  debug_mode: boolean;
}

export interface FollowUpCadence {
  id: number;
  regra: string;
  status: string;
  mensagem1: string;
  mensagem2: string;
  mensagem3: string;
}

export interface InstanceState {
  instanceName: string;
  isWhatsAppConnected: boolean;
}

export interface DashboardData {
  kpis: {
    totalLeads: number;
    totalCompras: number;
    totalFaturado: number;
    ticketMedio: number;
    taxaConversao: number;
  };
  leadsPorDia: { name: string; leads: number; }[];
}

export interface ToastMessage {
    message: string;
    type: 'success' | 'error' | 'warning';
}

export interface User {
  name: string;
  email: string;
  photoUrl: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  agent_name: string;
  level: 'INFO' | 'DEBUG' | 'ERROR' | 'WARNING';
  message: string;
  details?: Record<string, any> | string;
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  isDanger?: boolean;
}