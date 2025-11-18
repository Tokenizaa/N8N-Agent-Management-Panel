export type View = 'agents' | 'settings' | 'follow-up' | 'instance' | 'dashboard' | 'toast' | 'roadmap' | 'leads';

export interface Agent {
  id: number;
  name: string;
  description: string;
  prompt: string;
  is_default: boolean;
  is_active: boolean;
  available_tools?: number[];
  sort_order: number;
  enable_follow_up: boolean;
  status?: 'online' | 'busy' | 'offline';
}

export interface AgentConfig {
  waitTime: number;
  notificationTrigger: string;
  notificationNumbers: string;
  is_active: boolean;
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

export interface LeadDetail {
  id: string;
  name: string;
  value: number;
  date: string;
  agent: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  lastAgent: string;
  status: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  lastContact: string;
  value: number;
  customAttributes: { [key: string]: string };
  history: { type: 'incoming' | 'outgoing' | 'note'; content: string; timestamp: string; agent?: string }[];
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
  leadDetails?: {
      compras: LeadDetail[];
      leads: LeadDetail[];
  }
}

export interface ToastMessage {
    message: string;
    type: 'success' | 'error' | 'warning';
}

export interface ConnectionLog {
  timestamp: string;
  status: 'connected' | 'disconnected' | 'error';
  message: string;
}

// Roadmap Types
export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  icon?: 'database' | 'workflow' | 'code';
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  subTasks: SubTask[];
}

export interface Category {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  isExpanded: boolean;
  categories: Category[];
}