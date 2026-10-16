import React, { useState } from 'react';
import type { IFlag, FlagEnvironment, IUserEvaluationContext } from '../types/flag.types';
import { evaluateFlag, calculateUserBucket } from '../utils/evaluator';

interface RuleSimulatorModalProps {
    flag: IFlag;
    environment: FlagEnvironment;
    isOpen: boolean;
    onClose: () => void;
}

export const RuleSimulatorModal: React.FC<RuleSimulatorModalProps> = ({
    flag,
    environment,
    isOpen,
    onClose
}) => {
    const [userId, setUserId] = useState('usr_1024');
    const [email, setEmail] = useState('developer@company.com');
    const [role, setRole] = useState('beta_tester');

    if (!isOpen) return null;

    const mockUser: IUserEvaluationContext = {
        id: userId,
        email,
        role
    };

    const isEligible = evaluateFlag(flag, environment, mockUser);
    const userBucket = userId ? calculateUserBucket(userId, flag.key) : 0;
    const envConfig = flag.environments[environment];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-semibold text-white">
                        Simulador de Evaluación: <span className="font-mono text-indigo-400">{flag.key}</span>
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">User ID</label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Rol</label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resultado Determinista</h4>
                        <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-slate-300">Bucket asignado (djb2 hash):</span>
                            <span className="font-mono text-white">{userBucket} / 100</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-sm">
                            <span className="text-slate-300">Rollout del entorno ({environment}):</span>
                            <span className="font-mono text-white">{envConfig?.rolloutPercentage ?? 0}%</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                            <span className="text-sm font-medium text-slate-200">Evaluación Final:</span>
                            <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${isEligible ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}
                            >
                                {isEligible ? 'ACTIVADO (TRUE)' : 'DESACTIVADO (FALSE)'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
