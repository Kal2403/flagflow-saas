import { useState, useMemo } from 'react';
import type { FlagEnvironment } from './features/flags/types/flag.types';
import { FeatureFlagProvider, useFeatureFlagsContext } from './context/FeatureFlagContext';
import { FlagCard } from './features/flags/components/FlagCard';
import { flagsApi } from './features/flags/services/flags.api';

const DashboardContent = () => {
    const { flags, isConnected, isLoading, environment } = useFeatureFlagsContext();
    const [selectedEnv, setSelectedEnv] = useState<FlagEnvironment>(environment as FlagEnvironment);

    const flagList = useMemo(() => Object.values(flags), [flags]);

    const handleToggle = async (key: string, env: FlagEnvironment, enabled: boolean) => {
        await flagsApi.toggleEnvironment(key, env, enabled);
    };

    const handleUpdateRollout = async (key: string, env: FlagEnvironment, percentage: number) => {
        await flagsApi.updateRollout(key, env, percentage);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/30">
                            ⚑
                        </div>
                        <h1 className="text-lg font-bold text-white">FlagFlow Console</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs">
                            <span
                                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400 animate-pulse'
                                    }`}
                            />
                            <span className="text-slate-400">
                                {isConnected ? 'SSE Live Stream' : 'Conectando Stream...'}
                            </span>
                        </div>

                        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
                            {(['development', 'staging', 'production'] as FlagEnvironment[]).map((env) => (
                                <button
                                    key={env}
                                    onClick={() => setSelectedEnv(env)}
                                    className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all ${selectedEnv === env
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {env}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="flex items-center justify-between pb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Feature Flags & Rollout</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Modifica parámetros en vivo. Los clientes conectados recibirán actualizaciones vía Redis Pub/Sub e invalidación SSE inmediata.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <span className="text-sm font-medium text-slate-500">Cargando banderas de configuración...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {flagList.map((flag) => (
                            <FlagCard
                                key={flag._id}
                                flag={flag}
                                selectedEnvironment={selectedEnv}
                                onToggle={handleToggle}
                                onUpdateRollout={handleUpdateRollout}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default function App() {
    return (
        <FeatureFlagProvider environment="production">
            <DashboardContent />
        </FeatureFlagProvider>
    );
}
