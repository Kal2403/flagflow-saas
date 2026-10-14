import { Response } from "express";
import { CacheService } from "./cache.service.js";

interface ClientConnection {
    id: string;
    res: Response;
    environment: string;
}

export class SseService {
    private static clients: Map<string, ClientConnection> = new Map();
    private static isSubscribed = false;
    private static heartbeatInterval: NodeJS.Timeout | null = null;

    public static init(): void {
        if (!this.isSubscribed) {
            CacheService.subscribeToMutations((event) => {
                this.broadcast(event);
            });
            this.isSubscribed = true;
            this.startHeartbeat();
        }
    }

    public static addClient(id: string, res: Response, environment: string): void {
        this.clients.set(id, { id, res, environment });

        res.write('retry: 3000\n\n');
        res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clientId: id })}\n\n`);
    }

    public static removeClient(id: string): void {
        this.clients.delete(id);
    }

    public static broadcast(payload: { action: string; flagKey: string; data: any; timestamp: number }): void {
        const formattedData = `event: flag-update\ndata: ${JSON.stringify(payload)}\n\n`

        for (const [_, client] of this.clients) {
             const flagEnvData = payload.data?.environments?.[client.environment];
             if (flagEnvData || payload.action === 'INVALIDATE') {
                client.res.write(formattedData);
             }
        }
    }

    private static startHeartbeat(): void {
        if (this.heartbeatInterval) return;
        this.heartbeatInterval = setInterval(() => {
            for (const [_, client] of this.clients) {
                client.res.write(': keep-alive\n\n');
            }
        }, 2500);
    }
}
