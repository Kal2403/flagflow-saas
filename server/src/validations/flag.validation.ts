import { z } from 'zod';

export const FlagEnvironmentEnum = z.enum(['development', 'staging', 'production']);
export const FlagTypeEnum = z.enum(['boolean', 'percentage', 'targeted']);

export const flagRuleSchema = z.object({
    attribute: z.string().min(1, 'Attribute is required'),
    operator: z.enum(['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'IN']),
    values: z.array(z.string()).min(1, 'At least one value required')
});

export const environmentConfigSchema = z.object({
    enabled: z.boolean().default(false),
    rolloutPercentage: z.number().min(0).max(100).default(0),
    rules: z.array(flagRuleSchema).default([])
});

export const createFlagSchema = z.object({
    key: z
        .string()
        .min(3, 'Key must be at least 3 characters')
        .max(64, 'Key must not exceed 64 characters')
        .regex(/^[a-z0-9_-]+$/, 'Key must be alphanumeric, hyphen or underscore only'),
    description: z.string().max(255).default(''),
    type: FlagTypeEnum.default('boolean'),
    environments: z.record(FlagEnvironmentEnum, environmentConfigSchema)
});

export type IFlagRule = z.infer<typeof flagRuleSchema>;
export type IEnvironmentConfig = z.infer<typeof environmentConfigSchema>;
export type ICreateFlagInput = z.infer<typeof createFlagSchema>;
