import { Schema, model, Document, Model } from 'mongoose';
import { IEnvironmentConfig, IFlagRule } from '../validations/flag.validation.js';

export interface IFlagDocument extends Document {
    key: string;
    description: string;
    type: 'boolean' | 'percentage' | 'targeted';
    environments: Map<string, IEnvironmentConfig>;
    createdAt: Date;
    updatedAt: Date;
}

const FlagRuleSchema = new Schema<IFlagRule>(
    {
        attribute: { type: String, required: true },
        operator: {
            type: String,
            required: true,
            enum: ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'IN']
        },
        values: { type: [String], required: true, default: [] }
    },
    { _id: false }
);

const EnvironmentConfigSchema = new Schema<IEnvironmentConfig>(
    {
        enabled: { type: Boolean, required: true, default: false },
        rolloutPercentage: { type: Number, required: true, min: 0, max: 100, default: 0 },
        rules: { type: [FlagRuleSchema], default: [] }
    },
    { _id: false }
);

const FlagSchema = new Schema<IFlagDocument>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
        description: { type: String, trim: true, default: '' },
        type: {
            type: String,
            required: true,
            enum: ['boolean', 'percentage', 'targeted'],
            default: 'boolean'
        },
        environments: {
            type: Map,
            of: EnvironmentConfigSchema,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

FlagSchema.index({ key: 1, 'environments.production.enabled': 1 });

export const FlagModel: Model<IFlagDocument> = model<IFlagDocument>('Flag', FlagSchema);
