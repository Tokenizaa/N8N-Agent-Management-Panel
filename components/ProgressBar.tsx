import React from 'react';

interface ProgressBarProps {
    progress: number;
    height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 'h-2' }) => {
    return (
        <div className={`w-full bg-surface-bright rounded-full ${height} overflow-hidden`}>
            <div
                className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;