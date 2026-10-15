import type { IEnvironmentConfig, IFlag, IFlagRule, IUserEvaluationContext } from '../types/flag.types';

export const calculateUserBucket = (userId: string, flagKey: string): number => {
    const hashInput = `${userId}:${flagKey}`;
    let hash = 5381;
    for (let i = 0; i < hashInput.length; i++) {
        hash = (hash * 33) ^ hashInput.charCodeAt(i);
    }
    return Math.abs(hash >>> 0) % 100;
};

const evaluateRule = (rule: IFlagRule, context: IUserEvaluationContext): boolean => {
    const userValue = context[rule.attribute];
    if (userValue === undefined || userValue === null) return false;

    const stringifiedUserValue = String(userValue);

    switch (rule.operator) {
        case 'EQUALS':
            return rule.values.includes(stringifiedUserValue);
        case 'NOT_EQUALS':
            return !rule.values.includes(stringifiedUserValue);
        case 'CONTAINS':
            return rule.values.some((val) => stringifiedUserValue.includes(val));
        case 'IN':
            return rule.values.includes(stringifiedUserValue);
        default:
            return false;
    }
};

export const evaluateFlag = (
    flag: IFlag | undefined,
    environment: string,
    context?: IUserEvaluationContext
): boolean => {
    if (!flag) return false;

    const envConfig: IEnvironmentConfig | undefined = flag.environments[environment as keyof typeof flag.environments];
    if (!envConfig || !envConfig.enabled) return false;

    if (envConfig.rules && envConfig.rules.length > 0 && context) {
        const passedTargeting = envConfig.rules.every((rule) => evaluateRule(rule, context));
        if (!passedTargeting) return false;
    }

    if (envConfig.rolloutPercentage < 100) {
        if (!context?.id) {
            return false;
        }
        const bucket = calculateUserBucket(context.id, flag.key);
        return bucket < envConfig.rolloutPercentage;
    }

    return true;
};
