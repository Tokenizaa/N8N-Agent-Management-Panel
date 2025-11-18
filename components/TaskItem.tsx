import React from 'react';
import { Task } from '../types';
import { DatabaseIcon, WorkflowIcon, CodeIcon } from './icons/Icons';
import Checkbox from './Checkbox';

interface TaskItemProps {
    task: Task;
    onToggleTask: (taskId: string) => void;
    onToggleSubTask: (subTaskId: string) => void;
}

const IconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    database: DatabaseIcon,
    workflow: WorkflowIcon,
    code: CodeIcon,
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleTask, onToggleSubTask }) => {
    return (
        <div className="bg-surface p-3 rounded-md">
            <div className="flex items-center">
                <Checkbox id={task.id} checked={task.completed} onChange={() => onToggleTask(task.id)} />
                <label htmlFor={task.id} className={`flex-grow ml-3 text-sm font-medium ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary'} cursor-pointer`}>
                    {task.text}
                </label>
            </div>
            {task.subTasks.length > 0 && (
                <div className="pl-8 pt-2 mt-2 border-t border-surface-bright space-y-2">
                    {task.subTasks.map(subTask => {
                        const Icon = subTask.icon ? IconMap[subTask.icon] : null;
                        return (
                            <div key={subTask.id} className="flex items-center">
                                <Checkbox id={subTask.id} checked={subTask.completed} onChange={() => onToggleSubTask(subTask.id)} />
                                <label htmlFor={subTask.id} className={`flex-grow ml-3 text-xs ${subTask.completed ? 'line-through text-text-secondary/70' : 'text-text-secondary'} cursor-pointer flex items-center`}>
                                    {Icon && <Icon className="w-3.5 h-3.5 mr-2 flex-shrink-0" />}
                                    <span dangerouslySetInnerHTML={{ __html: subTask.text.replace(/`([^`]+)`/g, '<code class="bg-background text-primary/80 px-1 py-0.5 rounded text-[11px] font-mono">$&</code>').replace(/`/, '').replace(/`/, '') }}></span>
                                </label>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TaskItem;