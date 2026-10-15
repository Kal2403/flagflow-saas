export type FlagEnvironment = 'development' | 'staging' | 'production';

export type FlagRuleOperator = 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'IN';

export interface IFlagRule {
    attribute: string;
    operator: FlagRuleOperator;
    values: string[];
}

export interface IEnvironmentConfig {
    enabled: boolean;
    rolloutPercentage: number;
    rules: IFlagRule[];
}

export interface IFlag {
    _id: string;
    key: string;
    description: string;
    type: 'boolean' | 'percentage' | 'targeted';
    environments: Record<FlagEnvironment, IEnvironmentConfig>;
    createdAt: string;
    updatedAt: string;
}

export interface IUserEvaluationContext {
    id: string;
    email?: string;
    country?: string;
    role?: string;
    [key: string]: string | number | boolean | undefined;
}

export interface IFlagStreamEvent {
    action: 'INVALIDATE' | 'UPDATE' | 'DELETE';
    flagKey: string;
    data: IFlag;
    timestamp: number;
}
