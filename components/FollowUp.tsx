import React, { useState, useEffect } from 'react';
import { FollowUpCadence } from '../types';
import { TrashIcon, SpinnerIcon } from './icons/Icons';

interface FollowUpProps {
  cadences: FollowUpCadence[];
  onUpdate: (newCadences: FollowUpCadence[]) => void;
  isSaving: boolean;
}

const FollowUp: React.FC<FollowUpProps> = ({ cadences, onUpdate, isSaving }) => {
  const [localCadences, setLocalCadences] = useState<FollowUpCadence[]>(cadences);
  
  useEffect(() => {
      setLocalCadences(cadences);
  }, [cadences]);

  const handleUpdate = () => {
    // Filter out any empty rows before saving
    const validCadences = localCadences.filter(c => c.regra.trim() !== '' && c.status.trim() !== '');
    onUpdate(validCadences);
  };
  
  const handleRemoveRow = (id: number) => {
    setLocalCadences(prev => prev.filter(c => c.id !== id));
  };
  
  const handleAddRow = () => {
      const newId = localCadences.length > 0 ? Math.max(...localCadences.map(c => c.id)) + 1 : 1;
      setLocalCadences(prev => [...prev, {
          id: newId,
          regra: '',
          status: '',
          mensagem1: '',
          mensagem2: '',
          mensagem3: '',
      }]);
  };
  
  const handleChange = (id: number, field: keyof FollowUpCadence, value: string) => {
      setLocalCadences(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const inputClass = "w-full bg-surface border-0 focus:ring-1 focus:ring-primary rounded-md p-1";

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary">Cadência de Follow-up</h2>
            <button
              onClick={handleAddRow}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white bg-success hover:bg-opacity-80 transition duration-200"
            >
              Adicionar Nova Regra
            </button>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-text-secondary">
          <thead className="text-xs text-text-primary uppercase bg-surface-bright">
            <tr>
              <th scope="col" className="px-4 py-3 w-1/12">REGRA</th>
              <th scope="col" className="px-4 py-3 w-1/12">STATUS</th>
              <th scope="col" className="px-4 py-3 w-3/12">MENSAGEM 1</th>
              <th scope="col" className="px-4 py-3 w-3/12">MENSAGEM 2</th>
              <th scope="col" className="px-4 py-3 w-3/12">MENSAGEM 3</th>
              <th scope="col" className="px-4 py-3">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {localCadences.map((cadence) => (
              <tr key={cadence.id} className="bg-surface border-b border-surface-bright hover:bg-surface-bright/80 align-top">
                <td className="px-2 py-2"><input type="text" value={cadence.regra} onChange={e => handleChange(cadence.id, 'regra', e.target.value)} className={inputClass} placeholder="Ex: 5m, 1h, 3d" /></td>
                <td className="px-2 py-2"><input type="text" value={cadence.status} onChange={e => handleChange(cadence.id, 'status', e.target.value)} className={inputClass} placeholder="Label no CRM" /></td>
                <td className="px-2 py-2"><textarea value={cadence.mensagem1} onChange={e => handleChange(cadence.id, 'mensagem1', e.target.value)} className={inputClass} rows={3}></textarea></td>
                <td className="px-2 py-2"><textarea value={cadence.mensagem2} onChange={e => handleChange(cadence.id, 'mensagem2', e.target.value)} className={inputClass} rows={3}></textarea></td>
                <td className="px-2 py-2"><textarea value={cadence.mensagem3} onChange={e => handleChange(cadence.id, 'mensagem3', e.target.value)} className={inputClass} rows={3}></textarea></td>
                <td className="px-2 py-2 text-center">
                  <button onClick={() => handleRemoveRow(cadence.id)} className="text-danger hover:text-red-400 p-2">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <div className="flex justify-end pt-4">
        <button
          onClick={handleUpdate}
          disabled={isSaving}
          className="px-8 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-opacity-80 transition duration-200 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default FollowUp;