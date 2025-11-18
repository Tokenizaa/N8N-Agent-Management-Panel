import React, { useState, useEffect, useRef } from 'react';
import { InstanceState } from '../types';
import { PowerIcon, CheckCircleIcon, XCircleIcon, WhatsappIcon } from './icons/Icons';

interface InstanceProps {
  instanceState: InstanceState;
  onGenerateQRCode: (instanceName: string) => Promise<string>;
  onCheckStatus: () => void;
  onDisconnect: () => void;
  onCheckNumber: (number: string) => Promise<{ onWhatsApp: boolean; number: string } | null>;
}

type ValidationResult = {
    onWhatsApp: boolean;
    number: string;
}

const Instance: React.FC<InstanceProps> = ({ instanceState, onGenerateQRCode, onCheckStatus, onDisconnect, onCheckNumber }) => {
  const [name, setName] = useState(instanceState.instanceName);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  
  const [validationNumber, setValidationNumber] = useState('');
  const [isCheckingNumber, setIsCheckingNumber] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const qrPollInterval = useRef<number | null>(null);
  const statusPollInterval = useRef<number | null>(null);

  // Poll for status when view is active
  useEffect(() => {
    onCheckStatus(); // Initial check
    statusPollInterval.current = window.setInterval(onCheckStatus, 10000); // Poll every 10 seconds

    return () => {
      if (statusPollInterval.current) clearInterval(statusPollInterval.current);
      if (qrPollInterval.current) clearInterval(qrPollInterval.current);
    };
  }, [onCheckStatus]);


  const clearQrPolling = () => {
    if (qrPollInterval.current) {
        clearInterval(qrPollInterval.current);
        qrPollInterval.current = null;
    }
  };

  const handleGenerate = async () => {
    if (name.trim() && !isGenerating) {
      setIsGenerating(true);
      setIsConnecting(true);
      setConnectionMessage('Gerando QR Code...');
      setQrCodeUrl(null);
      clearQrPolling();
      
      try {
        const url = await onGenerateQRCode(name.trim());
        if (url) {
            setQrCodeUrl(url);
            setConnectionMessage('Aguardando leitura do QR Code...');

            // Start polling for connection status
            qrPollInterval.current = window.setInterval(async () => {
                await onCheckStatus();
            }, 3000);

            // Set a timeout for the connection attempt
            setTimeout(() => {
                if (qrPollInterval.current) {
                    clearQrPolling();
                    setIsConnecting(false);
                    setConnectionMessage('Tempo esgotado. Tente gerar um novo QR Code.');
                }
            }, 120000); // 2 minutes timeout
        } else {
             setIsGenerating(false);
             setIsConnecting(false);
             setConnectionMessage('Falha ao gerar o QR Code.');
        }

      } catch (error) {
        console.error("Failed to generate QR Code", error);
        setIsGenerating(false);
        setIsConnecting(false);
        setConnectionMessage('Erro ao se comunicar com o servidor.');
      } finally {
        setIsGenerating(false);
      }
    }
  };
  
  // Effect to check connection status after polling
  useEffect(() => {
      if(isConnecting && instanceState.isWhatsAppConnected) {
          clearQrPolling();
          setIsConnecting(false);
          setQrCodeUrl(null);
          setConnectionMessage('Conexão estabelecida com sucesso!');
          setTimeout(() => setConnectionMessage(''), 3000);
      }
  }, [instanceState.isWhatsAppConnected, isConnecting]);

  const handleValidateNumber = async () => {
    if (validationNumber.trim() && !isCheckingNumber) {
        setIsCheckingNumber(true);
        setValidationResult(null);
        const result = await onCheckNumber(validationNumber.trim());
        if (result) {
            setValidationResult(result);
        }
        setIsCheckingNumber(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Status Card */}
        <div className="p-6 bg-surface-bright rounded-lg border border-surface-bright space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Status da Conexão</h3>
          <div className="flex items-center justify-between">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${instanceState.isWhatsAppConnected ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                <span className={`h-2.5 w-2.5 rounded-full mr-2 ${instanceState.isWhatsAppConnected ? 'bg-success animate-pulse' : 'bg-danger'}`}></span>
                {instanceState.isWhatsAppConnected ? 'Conectado' : 'Desconectado'}
            </div>
            <button
                onClick={onDisconnect}
                disabled={!instanceState.isWhatsAppConnected}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-danger hover:bg-opacity-80 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                <PowerIcon className="w-4 h-4 mr-2" />
                Desconectar
            </button>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="p-6 bg-surface-bright rounded-lg border border-surface-bright text-center space-y-6">
            <h2 className="text-xl font-bold text-text-primary">Conectar Instância</h2>
            <div className="space-y-2">
            <label htmlFor="instance-name" className="block text-sm font-medium text-text-secondary">
                Nome da instância
            </label>
            <input
                type="text"
                id="instance-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-surface-bright rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
            />
            </div>
            <button
                onClick={handleGenerate}
                disabled={isGenerating || isConnecting}
                className="w-full px-8 py-3 rounded-lg font-semibold text-white bg-primary hover:bg-opacity-80 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
            {isConnecting ? 'Conectando...' : isGenerating ? 'Gerando...' : 'Gerar QR Code'}
            </button>

            {(qrCodeUrl || isConnecting) && (
            <div className="mt-8 pt-6 border-t border-surface-bright flex flex-col items-center">
                <p className="text-text-secondary mb-4 h-5">{connectionMessage}</p>
                {qrCodeUrl ? (
                    <div className="p-2 bg-white rounded-lg">
                        <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                    </div>
                ) : (
                    <div className="w-64 h-64 flex items-center justify-center bg-background rounded-lg">
                        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    </div>
                )}
            </div>
            )}
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        <div className="p-6 bg-surface-bright rounded-lg border border-surface-bright space-y-6">
            <div className="flex items-center space-x-3">
                <WhatsappIcon className="w-8 h-8 text-success" />
                <h3 className="text-lg font-semibold text-text-primary">Verificador de Número</h3>
            </div>
            <p className="text-sm text-text-secondary">
                Verifique se um número de telefone possui uma conta ativa no WhatsApp. Inclua o código do país (ex: 55 para o Brasil).
            </p>
            <div className="space-y-2">
                <input
                    type="tel"
                    value={validationNumber}
                    onChange={(e) => setValidationNumber(e.target.value)}
                    placeholder="Ex: 5511999998888"
                    className="w-full bg-background border border-surface-bright rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                />
            </div>
            <button
                onClick={handleValidateNumber}
                disabled={isCheckingNumber}
                className="w-full px-8 py-3 rounded-lg font-semibold text-white bg-success hover:bg-opacity-80 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isCheckingNumber ? 'Verificando...' : 'Verificar Número'}
            </button>
            {validationResult && (
                <div className={`p-4 rounded-lg text-center font-medium ${validationResult.onWhatsApp ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {validationResult.onWhatsApp ? (
                        <div className="flex items-center justify-center">
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            <span>O número <strong>{validationResult.number}</strong> está no WhatsApp.</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                             <XCircleIcon className="w-5 h-5 mr-2" />
                            <span>O número <strong>{validationResult.number}</strong> não foi encontrado no WhatsApp.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Instance;
