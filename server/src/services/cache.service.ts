import { redisClient, redisSubscriber } from "../config/redis.js";

export const FLAG_UPDATE_CHANNEL = 'flag:mutations:channel';

export class CacheService {
    private static readonly TTL_SECONDS = 3600;

    public static async get<T>(key: string): Promise<T | null> {
        const data = await redisClient.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    }

    public static async set(key: string, value: unknown, ttl = this.TTL_SECONDS): Promise<void> {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
    }

    public static async invalidateAndBroadcast(flagKey: string, payload: unknown): Promise<void> {
        const cacheKey = `flag:${flagKey}`;

        await redisClient.del(cacheKey);

        const message = JSON.stringify({
            action: 'INVALIDATE',
            flagKey,
            data: payload,
            timestamp: Date.now()
        });

        await redisClient.publish(FLAG_UPDATE_CHANNEL, message);
    }

    public static async subscribeToMutations(callback: (event: any) => void): Promise<void> {
        await redisSubscriber.subscribe(FLAG_UPDATE_CHANNEL);
        redisSubscriber.on('message', (channel, message) => {
            if (channel === FLAG_UPDATE_CHANNEL) {
                try {
                    const parsed = JSON.parse(message);
                    callback(parsed);
                } catch (error) {
                    console.error('❌ Error parsing Pub/Sub message payload:', error);
                }
            }
        });
    }
}
