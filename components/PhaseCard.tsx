import React, { useMemo } from 'react';
import { Phase, Category, Task } from '../types';
import { ChevronDownIcon, ChevronUpIcon } from './icons/Icons';
import ProgressBar from './ProgressBar';
import TaskItem from './TaskItem';

interface PhaseCardProps {
    phase: Phase;
    onTogglePhase: (phaseId: string) => void;
    onToggleTask: (taskId: string) => void;
    onToggleSubTask: (subTaskId: string) => void;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phase, onTogglePhase, onToggleTask, onToggleSubTask }) => {

    const phaseProgress = useMemo(() => {
        let total = 0;
        let completed = 0;
        phase.categories.forEach(cat => cat.tasks.forEach(task => task.subTasks.forEach(sub => {
            total++;
            if (sub.completed) completed++;
        })));
        return total > 0 ? (completed / total) * 100 : 0;
    }, [phase]);

    return (
        <div className="bg-surface-bright rounded-lg border border-surface-bright transition-all duration-300">
            <div className="p-4 cursor-pointer" onClick={() => onTogglePhase(phase.id)}>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">{phase.title}</h3>
                        <p className="text-sm text-text-secondary mt-1">{phase.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-24 hidden sm:block">
                            <ProgressBar progress={phaseProgress} height="h-1.5" />
                        </div>
                        {phase.isExpanded ? <ChevronUpIcon className="w-6 h-6 text-text-secondary" /> : <ChevronDownIcon className="w-6 h-6 text-text-secondary" />}
                    </div>
                </div>
            </div>

            {phase.isExpanded && (
                <div className="border-t border-surface p-4 space-y-4">
                    {phase.categories.map(category => (
                        <div key={category.id}>
                            <h4 className="font-semibold text-text-primary mb-3">{category.title}</h4>
                            <div className="space-y-3">
                                {category.tasks.map(task => (
                                    <TaskItem key={task.id} task={task} onToggleTask={onToggleTask} onToggleSubTask={onToggleSubTask} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PhaseCard;