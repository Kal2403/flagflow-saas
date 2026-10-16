import React, { useState } from 'react';
import type { IFlag, FlagEnvironment } from '../types/flag.types';
import { Switch } from '../../../components/common/Switch';
import { RuleSimulatorModal } from './RuleSimulatorModal';

interface FlagCardProps {
    flag: IFlag;
    selectedEnvironment: FlagEnvironment;
    onToggle: (key: string, env: FlagEnvironment, enabled: boolean) => Promise<void>;
    onUpdateRollout: (key: string, env: FlagEnvironment, percentage: number) => Promise<void>;
}

export const FlagCard: React.FC<FlagCardProps> = ({
    flag,
    selectedEnvironment,
    onToggle,
    onUpdateRollout
}) => {
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
    const [isMutating, setIsMutating] = useState(false);

    const envConfig = flag.environments[selectedEnvironment] || {
        enabled: false,
        rolloutPercentage: 0,
        rules: []
    };

    const handleToggle = async (enabled: boolean) => {
        try {
            setIsMutating(true);
            await onToggle(flag.key, selectedEnvironment, enabled);
        } finally {
            setIsMutating(false);
        }
    };

    const handleRolloutChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        await onUpdateRollout(flag.key, selectedEnvironment, val);
    };

    return (
        <>
            <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
                <div>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                                {flag.type}
                            </span>
                            <h3 className="mt-2 font-mono text-base font-bold text-white">{flag.key}</h3>
                        </div>
                        <Switch
                            checked={envConfig.enabled}
                            onChange={handleToggle}
                            disabled={isMutating}
                        />
                    </div>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{flag.description || 'Sin descripción'}</p>
                </div>

                <div className="mt-6 border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Rollout Progresivo</span>
                        <span className="font-mono font-medium text-white">{envConfig.rolloutPercentage}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={envConfig.rolloutPercentage}
                        onChange={handleRolloutChange}
                        disabled={!envConfig.enabled || isMutating}
                        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-indigo-500 disabled:opacity-40"
                    />

                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Reglas: {envConfig.rules?.length || 0}
                        </span>
                        <button
                            onClick={() => setIsSimulatorOpen(true)}
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Simular Evaluación →
                        </button>
                    </div>
                </div>
            </div>

            <RuleSimulatorModal
                flag={flag}
                environment={selectedEnvironment}
                isOpen={isSimulatorOpen}
                onClose={() => setIsSimulatorOpen(false)}
            />
        </>
    );
};
