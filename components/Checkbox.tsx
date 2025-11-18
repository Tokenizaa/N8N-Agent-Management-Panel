import React from 'react';
import { CheckIcon } from './icons/Icons';

interface CheckboxProps {
    id: string;
    checked: boolean;
    onChange: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange }) => {
    return (
        <div className="flex items-center">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only"
            />
            <label
                htmlFor={id}
                className={`w-5 h-5 rounded flex-shrink-0 cursor-pointer flex items-center justify-center border-2 transition-colors duration-200 
                ${checked ? 'bg-primary border-primary' : 'bg-surface border-surface-bright hover:border-primary/50'}`}
                aria-hidden="true"
            >
                {checked && <CheckIcon className="w-3 h-3 text-white" />}
            </label>
        </div>
    );
};

export default Checkbox;