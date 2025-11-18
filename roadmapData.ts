
import { Phase } from './types';

export const roadmapData: Phase[] = [
  {
    id: 'phase-1',
    title: 'Fase 1: Fundações da Orquestração e Inteligência',
    description: 'Refatorar o "cérebro" do sistema para torná-lo modular e mais inteligente, o que é pré-requisito para muitas outras melhorias.',
    isExpanded: true,
    categories: [
      {
        id: 'cat-1-1',
        title: '1. Melhorias na Orquestração e Lógica dos Agentes (N8N Core)',
        tasks: [
          {
            id: 'task-1-1-1',
            text: '1.1. Implementar o Agente Roteador Centralizado',
            completed: true,
            subTasks: [
              { id: 'sub-1-1-1-1', text: 'Banco de Dados: Adicionar um novo agente chamado "Roteador de Intenção" na tabela `agents`.', completed: true, icon: 'database' },
              { id: 'sub-1-1-1-2', text: 'Workflow Principal: Modificar o início do workflow para que toda mensagem passe pela etapa de "Roteamento".', completed: true, icon: 'workflow' },
              { id: 'sub-1-1-1-3', text: 'N8N - Lógica de Roteamento: Criar lógica com Gemini e Switch para adicionar a label `agent:*` correta no Chatwoot.', completed: true, icon: 'code' },
              { id: 'sub-1-1-1-4', text: 'Workflow Principal: Ajustar o carregamento de agentes para verificar a nova label `agent:*`.', completed: true, icon: 'workflow' },
            ]
          },
          {
            id: 'task-1-1-2',
            text: '1.2. Implementar Handover com Resumo (Contexto Perfeito)',
            completed: true,
            subTasks: [
              { id: 'sub-1-1-2-1', text: 'Workflow Principal: Adicionar passo de geração de resumo com Gemini antes da escalação.', completed: true, icon: 'workflow' },
              { id: 'sub-1-1-2-2', text: 'N8N - API Chatwoot: Postar o resumo gerado como uma nota privada na conversa.', completed: true, icon: 'code' },
              { id: 'sub-1-1-2-3', text: 'Workflow Principal: Modificar a formatação de histórico para incluir a última nota privada para agentes especialistas.', completed: true, icon: 'workflow' },
            ]
          },
          {
            id: 'task-1-1-3',
            text: '1.3. Criar Ferramenta de Escalação para Atendimento Humano',
            completed: false,
            subTasks: [
                { id: 'sub-1-1-3-1', text: 'N8N - Criar Sub-workflow: Desenvolver `[FERRAMENTA] Escalar para Humano`.', completed: false, icon: 'workflow' },
                { id: 'sub-1-1-3-2', text: 'Lógica do Sub-workflow: Mudar status da conversa, atribuir a uma equipe e enviar notificação (Slack/Telegram).', completed: false, icon: 'code' },
                { id: 'sub-1-1-3-3', text: 'Agentes: Adicionar a ferramenta `escalar_para_humano` ao prompt dos agentes.', completed: false, icon: 'code' },
            ]
          },
          {
            id: 'task-1-1-4',
            text: '1.4. Implementar "Desescalação" Automática',
            completed: false,
            subTasks: [
                { id: 'sub-1-1-4-1', text: 'Workflow Principal: Após resposta de especialista, usar Gemini para verificar se a tarefa foi concluída.', completed: false, icon: 'workflow' },
                { id: 'sub-1-1-4-2', text: 'N8N - API Chatwoot: Se a tarefa foi concluída, remover a label `agent:*` da conversa.', completed: false, icon: 'code' },
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'phase-2',
    title: 'Fase 2: Aprimoramentos de Contexto e Experiência',
    description: 'Com a orquestração funcionando, podemos tornar os agentes mais espertos e o sistema mais robusto.',
    isExpanded: false,
    categories: [
        {
            id: 'cat-2-1',
            title: '2. Aprimoramento da Inteligência e Contexto (Gemini + N8N)',
            tasks: [
                {
                    id: 'task-2-1-1',
                    text: '2.1. Implementar Extração de Entidades e Atributos no Chatwoot',
                    completed: true,
                    subTasks: [
                        { id: 'sub-2-1-1-1', text: 'Workflow Principal: Adicionar chamada assíncrona ao Gemini para extração de entidades.', completed: true, icon: 'workflow' },
                        { id: 'sub-2-1-1-2', text: 'N8N - Gemini: Usar `responseSchema` para extrair `nome`, `email`, etc.', completed: true, icon: 'code' },
                        { id: 'sub-2-1-1-3', text: 'N8N - API Chatwoot: Atualizar atributos customizados do contato com as entidades extraídas.', completed: true, icon: 'code' },
                    ]
                },
                {
                    id: 'task-2-1-2',
                    text: '2.2. Implementar Análise de Sentimento Proativa',
                    completed: false,
                    subTasks: [
                        { id: 'sub-2-1-2-1', text: 'Workflow Principal: Adicionar chamada assíncrona ao Gemini para classificar sentimento.', completed: true, icon: 'workflow' },
                        { id: 'sub-2-1-2-2', text: 'N8N - Lógica de Alerta: Se 3 mensagens forem negativas, adicionar label "Cliente em Risco" e notificar gestor.', completed: false, icon: 'code' },
                    ]
                }
            ]
        },
        {
            id: 'cat-2-2',
            title: '3. Otimização da Integração com o Chatwoot',
            tasks: [
                {
                    id: 'task-2-2-1',
                    text: '3.1. Criar Sincronização Bidirecional (Webhook do Chatwoot)',
                    completed: false,
                    subTasks: [
                        { id: 'sub-2-2-1-1', text: 'Chatwoot: Criar webhook para o evento `conversation_updated`.', completed: false, icon: 'workflow' },
                        { id: 'sub-2-2-1-2', text: 'N8N: Criar workflow para receber o webhook e filtrar por mudanças de label.', completed: false, icon: 'workflow' },
                    ]
                }
            ]
        }
    ]
  },
  {
    id: 'phase-3',
    title: 'Fase 3: Escalabilidade e Ferramentas Avançadas',
    description: 'Foco em garantir que a plataforma aguente alto volume e em expandir as capacidades dos agentes.',
    isExpanded: false,
    categories: [
        {
            id: 'cat-3-1',
            title: '4. Melhorias de Confiabilidade e Performance',
            tasks: [
                {
                    id: 'task-3-1-1',
                    text: '4.1. Implementar Fila de Processamento de Mensagens',
                    completed: false,
                    subTasks: [
                        { id: 'sub-3-1-1-1', text: 'Banco de Dados: Criar tabela `message_queue`.', completed: false, icon: 'database' },
                        { id: 'sub-3-1-1-2', text: 'Webhook Principal: Simplificar para apenas inserir mensagens na fila.', completed: false, icon: 'workflow' },
                        { id: 'sub-3-1-1-3', text: 'Workflow de Processamento: Criar novo workflow com Schedule Trigger para processar a fila.', completed: false, icon: 'workflow' },
                    ]
                },
                {
                    id: 'task-3-1-2',
                    text: '4.2. Implementar Monitoramento Ativo da Conexão Baileys',
                    completed: false,
                    subTasks: [
                        { id: 'sub-3-1-2-1', text: 'N8N: Criar workflow com Schedule Trigger para rodar a cada 5 minutos.', completed: false, icon: 'workflow' },
                        { id: 'sub-3-1-2-2', text: 'Lógica do Monitor: Chamar API de status do Baileys e enviar alerta se desconectado.', completed: false, icon: 'code' },
                    ]
                }
            ]
        },
        {
            id: 'cat-3-2',
            title: '5. Expansão das Ferramentas e Capacidades dos Agentes',
            tasks: [
                 {
                    id: 'task-3-2-1',
                    text: '5.1. Expandir Ferramentas de Agendamento (Google Calendar)',
                    completed: false,
                    subTasks: [
                        { id: 'sub-3-2-1-1', text: 'N8N: Criar sub-workflows para `verificar_disponibilidade`, `remarcar_consulta` e `cancelar_consulta`.', completed: false, icon: 'workflow' },
                        { id: 'sub-3-2-1-2', text: 'Agentes: Adicionar as novas ferramentas aos prompts relevantes.', completed: false, icon: 'code' },
                    ]
                },
                {
                    id: 'task-3-2-2',
                    text: '5.2. Criar Ferramenta de Busca em Base de Conhecimento',
                    completed: false,
                    subTasks: [
                        { id: 'sub-3-2-2-1', text: 'Base de Dados: Criar tabela `knowledge_base`.', completed: false, icon: 'database' },
                        { id: 'sub-3-2-2-2', text: 'N8N: Criar sub-workflow `[FERRAMENTA] Buscar na Base`.', completed: false, icon: 'workflow' },
                        { id: 'sub-3-2-2-3', text: 'Agentes: Adicionar a ferramenta nos prompts.', completed: false, icon: 'code' },
                    ]
                }
            ]
        }
    ]
  }
];