// server/src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/api-error.js';

export const validate = (schema: ZodSchema) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const issues = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
                next(new ApiError(400, `Validation failed: ${issues.join('; ')}`));
            } else {
                next(error);
            }
        }
    };
};
