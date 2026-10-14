import { FlagModel, IFlagDocument } from '../models/flag.model.js';
import { ICreateFlagInput, IUpdateFlagInput } from '../validations/flag.validation.js';
import { CacheService } from './cache.service.js';
import { ApiError } from '../utils/api-error.js';

export class FlagService {
    private static getCacheKey(key: string): string {
        return `flag:${key}`;
    }

    public static async createFlag(input: ICreateFlagInput): Promise<IFlagDocument> {
        const existingFlag = await FlagModel.findOne({ key: input.key });
        if (existingFlag) {
            throw new ApiError(409, `Flag with key "${input.key}" already exists`);
        }

        const flag = await FlagModel.create(input);
        await CacheService.set(this.getCacheKey(flag.key), flag.toJSON());
        await CacheService.invalidateAndBroadcast(flag.key, flag.toJSON());

        return flag;
    }

    public static async getFlagByKey(key: string): Promise<IFlagDocument> {
        const cached = await CacheService.get<IFlagDocument>(this.getCacheKey(key));
        if (cached) return cached;

        const flag = await FlagModel.findOne({ key });
        if (!flag) {
            throw new ApiError(404, `Flag "${key}" not found`);
        }

        await CacheService.set(this.getCacheKey(key), flag.toJSON());
        return flag;
    }

    public static async getAllFlags(): Promise<IFlagDocument[]> {
        return FlagModel.find().sort({ createdAt: -1 });
    }

    public static async updateFlag(key: string, input: IUpdateFlagInput): Promise<IFlagDocument> {
        const flag = await FlagModel.findOne({ key });
        if (!flag) {
            throw new ApiError(404, `Flag "${key}" not found`);
        }

        if (input.description !== undefined) flag.description = input.description;
        if (input.type !== undefined) flag.type = input.type;

        if (input.environments) {
            for (const [env, config] of Object.entries(input.environments)) {
                const currentEnvConfig = flag.environments.get(env) || {
                    enabled: false,
                    rolloutPercentage: 0,
                    rules: []
                };

                flag.environments.set(env, {
                    ...currentEnvConfig,
                    ...config
                });
            }
        }

        await flag.save();

        await CacheService.invalidateAndBroadcast(flag.key, flag.toJSON());
        await CacheService.set(this.getCacheKey(flag.key), flag.toJSON());

        return flag;
    }

    public static async deleteFlag(key: string): Promise<void> {
        const flag = await FlagModel.findOneAndDelete({ key });
        if (!flag) {
            throw new ApiError(404, `Flag "${key}" not found`);
        }

        await CacheService.invalidateAndBroadcast(key, { deleted: true });
    }
}
