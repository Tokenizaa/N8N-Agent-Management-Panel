import React from 'react';
import { Lead } from '../types';
import { CloseIcon, UserCircleIcon, BotIcon, NoteIcon } from './icons/Icons';

interface LeadDetailPanelProps {
  lead: Lead | undefined;
  onClose: () => void;
}

const TimelineIcon: React.FC<{type: Lead['history'][0]['type']}> = ({type}) => {
    const commonClasses = "w-8 h-8 p-1.5 rounded-full flex-shrink-0";
    switch(type) {
        case 'incoming': return <UserCircleIcon className={`${commonClasses} bg-blue-500/20 text-blue-400`} />;
        case 'outgoing': return <BotIcon className={`${commonClasses} bg-primary/20 text-primary`} />;
        case 'note': return <NoteIcon className={`${commonClasses} bg-yellow-500/20 text-yellow-400`} />;
        default: return null;
    }
}


const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({ lead, onClose }) => {
  const panelClasses = `fixed top-0 right-0 h-full w-full max-w-lg bg-surface-bright shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-l-2 border-surface ${lead ? 'translate-x-0' : 'translate-x-full'}`;

  return (
    <>
        {lead && <div className="fixed inset-0 bg-background/60 z-30" onClick={onClose}></div>}
        <div className={panelClasses}>
            {lead && (
                <div className="flex flex-col h-full">
                    <header className="p-4 flex justify-between items-center border-b border-surface">
                        <h2 className="text-xl font-bold text-text-primary">{lead.name}</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-surface hover:text-text-primary">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </header>
                    <div className="flex-grow p-6 overflow-y-auto space-y-8">
                        {/* Contact Details */}
                        <section>
                            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Detalhes do Contato</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-text-secondary">Telefone</p>
                                    <p className="text-text-primary font-mono">{lead.phone}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary">Status</p>
                                    <p className="text-text-primary capitalize">{lead.status.replace('-', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary">Valor</p>
                                    <p className="text-text-primary font-semibold">R$ {lead.value.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary">Último Contato</p>
                                    <p className="text-text-primary">{new Date(lead.lastContact).toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                        </section>

                        {/* Extracted Attributes */}
                        {Object.keys(lead.customAttributes).length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Atributos Extraídos (IA)</h3>
                                <div className="bg-surface rounded-md p-3 space-y-2">
                                    {Object.entries(lead.customAttributes).map(([key, value]) => (
                                        <div key={key} className="grid grid-cols-3 gap-2 text-sm items-center">
                                            <p className="text-text-secondary capitalize col-span-1">{key.replace('_', ' ')}</p>
                                            <p className="text-text-primary bg-background rounded px-2 py-1 col-span-2">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Conversation History */}
                        <section>
                            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Histórico da Conversa</h3>
                            <div className="space-y-4">
                                {lead.history.map((item, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <TimelineIcon type={item.type} />
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-baseline">
                                                <p className="text-sm font-semibold text-text-primary capitalize">
                                                    {item.type === 'incoming' ? 'Cliente' : (item.type === 'note' ? 'Nota Interna' : `Agente: ${item.agent}`)}
                                                </p>
                                                <p className="text-xs text-text-secondary">{new Date(item.timestamp).toLocaleTimeString('pt-BR')}</p>
                                            </div>
                                            <div className={`mt-1 p-3 rounded-lg text-sm ${
                                                item.type === 'incoming' ? 'bg-surface' : 'bg-surface'} 
                                                ${item.type === 'note' ? 'border-l-2 border-yellow-400 italic' : ''}
                                            `}>
                                                <p className="text-text-secondary">{item.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            )}
        </div>
    </>
  );
};

export default LeadDetailPanel;
