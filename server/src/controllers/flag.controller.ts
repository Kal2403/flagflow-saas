// server/src/controllers/flag.controller.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { SseService } from '../services/sse.service.js';
import { FlagService } from '../services/flag.service.js';

export class FlagController {
    public static streamFlags(req: Request, res: Response): void {
        const environment = typeof req.query.environment === 'string' ? req.query.environment : 'production';

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        res.flushHeaders();

        const clientId = crypto.randomUUID();
        SseService.addClient(clientId, res, environment);

        req.on('close', () => {
            SseService.removeClient(clientId);
            res.end();
        });
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const flag = await FlagService.createFlag(req.body);
            res.status(201).json({ success: true, data: flag });
        } catch (error) {
            next(error);
        }
    }

    public static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const flags = await FlagService.getAllFlags();
            res.status(200).json({ success: true, count: flags.length, data: flags });
        } catch (error) {
            next(error);
        }
    }

    public static async getByKey(req: Request<{ key: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const flag = await FlagService.getFlagByKey(req.params.key);
            res.status(200).json({ success: true, data: flag });
        } catch (error) {
            next(error);
        }
    }

    public static async update(req: Request<{ key: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const flag = await FlagService.updateFlag(req.params.key, req.body);
            res.status(200).json({ success: true, data: flag });
        } catch (error) {
            next(error);
        }
    }

    public static async remove(req: Request<{ key: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            await FlagService.deleteFlag(req.params.key);
            res.status(200).json({ success: true, message: `Flag "${req.params.key}" removed successfully` });
        } catch (error) {
            next(error);
        }
    }
}
