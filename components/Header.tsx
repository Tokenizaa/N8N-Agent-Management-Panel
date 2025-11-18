import React from 'react';

interface HeaderProps {
  workflowName: string;
  isFlowActive: boolean;
  onToggleFlow: () => void;
  isWhatsAppConnected: boolean;
}

const StatusIndicator: React.FC<{ label: string; active: boolean; children?: React.ReactNode }> = ({ label, active, children }) => {
  const activeClass = active ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger';
  const dotClass = active ? 'bg-success' : 'bg-danger';

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-text-secondary">{label}:</span>
      <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${activeClass}`}>
        <span className={`h-2 w-2 rounded-full mr-2 ${dotClass}`}></span>
        {children}
      </div>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ workflowName, isFlowActive, onToggleFlow, isWhatsAppConnected }) => {
  return (
    <header className="bg-surface p-4 sm:p-6 border-b border-surface-bright">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">
          <span className="text-text-secondary font-medium">Workflow:</span> {workflowName}
        </h1>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={onToggleFlow}>
            <span className="text-sm font-medium text-text-secondary">Status:</span>
            <div className={`relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in`}>
                <input type="checkbox" name="toggle" id="toggle" checked={isFlowActive} readOnly className={`toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer ${isFlowActive ? 'right-0 border-success' : 'left-0 border-gray-400'}`}/>
                <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${isFlowActive ? 'bg-success' : 'bg-gray-400'}`}></label>
            </div>
             <span className={`font-semibold ${isFlowActive ? 'text-success' : 'text-text-secondary'}`}>{isFlowActive ? 'Active' : 'Inactive'}</span>
          </div>

          <StatusIndicator label="WhatsApp" active={isWhatsAppConnected}>
            {isWhatsAppConnected ? 'Connected' : 'Disconnected'}
          </StatusIndicator>
        </div>
      </div>
      <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #4CAF50;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #4CAF50;
        }
      `}</style>
    </header>
  );
};

export default Header;
