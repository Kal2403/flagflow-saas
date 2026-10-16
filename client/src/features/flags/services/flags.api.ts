import type { IFlag, FlagEnvironment } from '../types/flag.types';

const API_BASE_URL = 'http://localhost:5000/api/v1/flags';

export const flagsApi = {
    async getAll(): Promise<IFlag[]> {
        const res = await fetch(API_BASE_URL);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error fetching flags');
        return json.data;
    },

    async toggleEnvironment(
        key: string,
        environment: FlagEnvironment,
        enabled: boolean
    ): Promise<IFlag> {
        const res = await fetch(`${API_BASE_URL}/${key}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                environments: {
                    [environment]: { enabled }
                }
            })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error updating flag status');
        return json.data;
    },

    async updateRollout(
        key: string,
        environment: FlagEnvironment,
        rolloutPercentage: number
    ): Promise<IFlag> {
        const res = await fetch(`${API_BASE_URL}/${key}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                environments: {
                    [environment]: { rolloutPercentage }
                }
            })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error updating rollout percentage');
        return json.data;
    }
};
