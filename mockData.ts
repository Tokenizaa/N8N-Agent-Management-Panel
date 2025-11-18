import { Lead } from './types';

export const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Ana Costa',
      phone: '+55 11 98765-4321',
      lastAgent: 'Assistente de Vendas',
      status: 'qualificado',
      sentiment: 'positive',
      lastContact: '2024-07-22T10:30:00Z',
      value: 350.00,
      customAttributes: { 'produto_interesse': 'Consulta Cardiologia', 'email': 'ana.costa@example.com' },
      history: [
        { type: 'incoming', content: 'Olá, gostaria de marcar uma consulta.', timestamp: '2024-07-22T10:25:00Z' },
        { type: 'outgoing', agent: 'Secretária', content: 'Olá Ana! Claro, para qual especialidade?', timestamp: '2024-07-22T10:26:00Z' },
        { type: 'incoming', content: 'Cardiologia, por favor.', timestamp: '2024-07-22T10:27:00Z' },
        { type: 'outgoing', agent: 'Assistente de Vendas', content: 'Perfeito, a consulta com o Dr. Roberto custa R$350. Posso agendar?', timestamp: '2024-07-22T10:30:00Z' },
      ]
    },
    {
      id: '2',
      name: 'Carlos Pereira',
      phone: '+55 21 91234-5678',
      lastAgent: 'Secretária',
      status: 'novo',
      sentiment: 'neutral',
      lastContact: '2024-07-21T15:10:00Z',
      value: 0,
      customAttributes: {},
      history: [
        { type: 'incoming', content: 'Qual o endereço da clínica?', timestamp: '2024-07-21T15:10:00Z' },
      ]
    },
    {
      id: '3',
      name: 'Mariana Lima',
      phone: '+55 31 99999-8888',
      lastAgent: 'Assistente de Vendas',
      status: 'em-risco',
      sentiment: 'negative',
      lastContact: '2024-07-20T11:45:00Z',
      value: 0,
      customAttributes: { 'produto_interesse': 'Consulta Odontologia' },
      history: [
         { type: 'outgoing', agent: 'Assistente de Vendas', content: 'Olá Mariana, podemos confirmar seu agendamento?', timestamp: '2024-07-20T11:40:00Z' },
         { type: 'incoming', content: 'Achei o valor muito caro, vou cancelar.', timestamp: '2024-07-20T11:45:00Z' },
         { type: 'note', content: 'Cliente achou o valor alto. Aplicar desconto na próxima interação.', timestamp: '2024-07-20T11:46:00Z' }
      ]
    },
    {
      id: '4',
      name: 'João Silva',
      phone: '+55 41 98877-6655',
      lastAgent: 'Gestor Financeiro',
      status: 'comprou',
      sentiment: 'positive',
      lastContact: '2024-07-19T18:00:00Z',
      value: 500.00,
      customAttributes: { 'produto_interesse': 'Check-up Completo', 'email': 'joao.silva@example.com', 'cpf': '123.456.789-00' },
      history: [
        { type: 'outgoing', agent: 'Gestor Financeiro', content: 'Seu pagamento foi confirmado! Obrigado.', timestamp: '2024-07-19T18:00:00Z' },
      ]
    }
  ];
