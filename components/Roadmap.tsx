import React from 'react';
import { Phase } from '../types';
import ProgressBar from './ProgressBar';
import PhaseCard from './PhaseCard';

interface RoadmapProps {
    phases: Phase[];
    progress: number;
    onTogglePhase: (phaseId: string) => void;
    onToggleTask: (taskId: string) => void;
    onToggleSubTask: (subTaskId: string) => void;
}

const Roadmap: React.FC<RoadmapProps> = ({ phases, progress, onTogglePhase, onToggleTask, onToggleSubTask }) => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Roadmap de Implementação</h2>
                <p className="text-text-secondary mt-1">Acompanhe o progresso da implementação das melhorias sugeridas.</p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-sm text-text-secondary">
                    <span>Progresso Geral</span>
                    <span className="font-semibold text-text-primary">{progress.toFixed(0)}%</span>
                </div>
                <ProgressBar progress={progress} />
            </div>

            <div className="space-y-4">
                {phases.map((phase) => (
                    <PhaseCard
                        key={phase.id}
                        phase={phase}
                        onTogglePhase={onTogglePhase}
                        onToggleTask={onToggleTask}
                        onToggleSubTask={onToggleSubTask}
                    />
                ))}
            </div>
        </div>
    );
};

export default Roadmap;