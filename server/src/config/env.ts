import dotenv from "dotenv";
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    REDIS_URL: z.string().min(1, 'REDIS_URL is required')
});

export type EnvConfig = z.infer<typeof envSchema>;

const getValidatedEnv = (): EnvConfig => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:', error.format());
        } else {
            console.error('❌ Unknown error loading environment variables:', error)
        }
        process.exit(1);
    }
};


export const env: EnvConfig = getValidatedEnv();
