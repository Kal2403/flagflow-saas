import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { SseService } from '../services/sse.service.js';

export class FlagController {
  public static streamFlags(req: Request, res: Response): void {
    const environment = (req.query.environment as string) || 'production';

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
}
