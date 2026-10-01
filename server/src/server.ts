import { app } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
    await connectDB();

    const server = app.listen(env?.PORT, () => {
        console.log(`🚀 Server listening on port ${env?.PORT} in ${env?.NODE_ENV} mode`);
    });

    const handleTermination = async (signal: string) => {
        console.log(`\n🛑 ${signal} received. Closing HTTP server gracefully...`);
        server.close(async () => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => handleTermination('SIGTERM'));
    process.on('SIGINT', () => handleTermination('SIGINT'));
};

startServer();
