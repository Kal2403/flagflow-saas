import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';

export const app: Application = express();

app.use(cors({ origin: env?.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timeStamp: new Date().toISOString() });
});

app.use(errorHandler);
