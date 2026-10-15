import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { IFlag, IFlagStreamEvent, IUserEvaluationContext } from '../features/flags/types/flag.types';
import { evaluateFlag } from '../features/flags/utils/evaluator';

interface FeatureFlagContextValue {
    flags: Record<string, IFlag>;
    isEnabled: (flagKey: string, defaultValue?: boolean) => boolean;
    isLoading: boolean;
    isConnected: boolean;
    environment: string;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

interface FeatureFlagProviderProps {
    children: ReactNode;
    environment: 'development' | 'staging' | 'production';
    userContext?: IUserEvaluationContext;
    apiBaseUrl?: string;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
    children,
    environment,
    userContext,
    apiBaseUrl = 'http://localhost:5000'
}) => {
    const [flags, setFlags] = useState<Record<string, IFlag>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        const fetchInitialFlags = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/v1/flags`);
                const json = await response.json();
                if (isMounted && json.success && Array.isArray(json.data)) {
                    const map: Record<string, IFlag> = {};
                    json.data.forEach((flag: IFlag) => {
                        map[flag.key] = flag;
                    });
                    setFlags(map);
                }
            } catch (err) {
                console.error('Failed to fetch initial flags:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchInitialFlags();
        return () => {
            isMounted = false;
        };
    }, [apiBaseUrl]);

    useEffect(() => {
        const sseUrl = `${apiBaseUrl}/api/v1/flags/stream?environment=${environment}`;
        const eventSource = new EventSource(sseUrl);

        eventSource.addEventListener('connected', () => {
            setIsConnected(true);
        });

        eventSource.addEventListener('flag-update', (event: MessageEvent) => {
            try {
                const payload: IFlagStreamEvent = JSON.parse(event.data);

                setFlags((prev) => {
                    if (payload.action === 'DELETE') {
                        const next = { ...prev };
                        delete next[payload.flagKey];
                        return next;
                    }
                    return {
                        ...prev,
                        [payload.flagKey]: payload.data
                    };
                });
            } catch (err) {
                console.error('Error parsing SSE stream message:', err);
            }
        });

        eventSource.onerror = () => {
            setIsConnected(false);
        };

        return () => {
            eventSource.close();
            setIsConnected(false);
        };
    }, [apiBaseUrl, environment]);

    const isEnabled = useCallback(
        (flagKey: string, defaultValue = false): boolean => {
            const flag = flags[flagKey];
            if (!flag) return defaultValue;
            return evaluateFlag(flag, environment, userContext);
        },
        [flags, environment, userContext]
    );

    const value = useMemo(
        () => ({
            flags,
            isEnabled,
            isLoading,
            isConnected,
            environment
        }),
        [flags, isEnabled, isLoading, isConnected, environment]
    );

    return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
};

export const useFeatureFlagsContext = (): FeatureFlagContextValue => {
    const ctx = useContext(FeatureFlagContext);
    if (!ctx) {
        throw new Error('useFeatureFlagsContext must be used within a FeatureFlagProvider');
    }
    return ctx;
};
