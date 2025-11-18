import React, { useState, useEffect } from 'react';
import { InstanceState, ConnectionLog } from '../types';

const MOCK_LOGS: ConnectionLog[] = [
    { timestamp: '2024-07-21 10:30:15', status: 'connected', message: 'Conexão estabelecida com sucesso.' },
    { timestamp: '2024-07-21 09:15:42', status: 'disconnected', message: 'Cliente desconectado via API.' },
    { timestamp: '2024-07-21 09:15:30', status: 'connected', message: 'Conexão estabelecida com sucesso.' },
    { timestamp: '2024-07-20 18:05:11', status: 'error', message: 'Falha ao autenticar, QR code expirado.' },
];

// FIX: Define the InstanceProps interface for the component's props.
interface InstanceProps {
  instanceState: InstanceState;
  onGenerateQRCode: (instanceName: string) => Promise<string>;
  onCheckStatus: () => void;
}

const Instance: React.FC<InstanceProps> = ({ instanceState, onGenerateQRCode, onCheckStatus }) => {
  const [name, setName] = useState(instanceState.instanceName);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isWhatsAppConnected } = instanceState;

  useEffect(() => {
    const intervalId = setInterval(() => {
      onCheckStatus();
    }, 30000); // Auto-refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [onCheckStatus]);


  const handleGenerate = async () => {
    if (name.trim() && !isGenerating) {
      setIsGenerating(true);
      setQrCodeUrl(null);
      try {
        const url = await onGenerateQRCode(name.trim());
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Failed to generate QR Code", error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const getStatusIcon = (status: ConnectionLog['status']) => {
    switch (status) {
        case 'connected': return <span className="text-success">✔</span>;
        case 'disconnected': return <span className="text-danger">✖</span>;
        case 'error': return <span className="text-warning">⚠</span>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="p-4 bg-surface-bright rounded-lg border border-surface-bright space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">Status da Conexão</h3>
          <div className="flex items-center justify-between">
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isWhatsAppConnected ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                <span className={`h-2 w-2 rounded-full mr-2 ${isWhatsAppConnected ? 'bg-success' : 'bg-danger'}`}></span>
                {isWhatsAppConnected ? 'Conectado' : 'Desconectado'}
            </div>
            <button
                onClick={onCheckStatus}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-surface-bright border border-primary hover:bg-primary/20 transition duration-200"
            >
                Verificar Status
            </button>
          </div>
        </div>

        <div className="text-center space-y-6 p-4 bg-surface-bright rounded-lg border border-surface-bright">
          <h2 className="text-xl font-bold text-text-primary">Gerador de QR Code</h2>
          <div className="space-y-2">
            <label htmlFor="instance-name" className="block text-sm font-medium text-text-secondary">
              Nome da instância
            </label>
            <input
              type="text"
              id="instance-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-surface rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full px-8 py-3 rounded-lg font-semibold text-white bg-primary hover:bg-opacity-80 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Gerando...' : 'Gerar QR Code'}
          </button>

          {qrCodeUrl && (
            <div className="mt-8 pt-6 border-t border-surface flex flex-col items-center">
                <p className="text-text-secondary mb-4">Escaneie o QR Code com seu WhatsApp para conectar.</p>
                <div className="p-2 bg-white rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 bg-surface-bright rounded-lg border border-surface-bright space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Log de Conexão</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {MOCK_LOGS.map((log) => (
                <div key={log.timestamp} className="text-xs flex items-start space-x-3">
                    <div className="pt-0.5">{getStatusIcon(log.status)}</div>
                    <div>
                        <span className="font-mono text-text-secondary">{log.timestamp}</span>
                        <p className="text-text-primary">{log.message}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Instance;