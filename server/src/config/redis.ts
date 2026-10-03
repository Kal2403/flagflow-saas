import { Redis } from 'ioredis';
import { env } from './env.js';

export const redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
    },
    lazyConnect: false
});

export const redisSubscriber = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        return Math.min(times * 200, 5000);
    },
    lazyConnect: false
});

redisClient.on('connect', () => {
    console.log('✅ Redis Command Client connected');
});

redisSubscriber.on('connect', () => {
    console.log('✅ Redis Subscriber Client connected');
});

redisClient.on('error', (err) => {
    console.log('❌ Redis Client Error:', err);
});

redisSubscriber.on('error', (err) => {
    console.log('❌ Redis Subscriber Error:', err);
});
