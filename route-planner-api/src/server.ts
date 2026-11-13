import { createApp } from './app';

const rawPort = process.env.PORT ?? '3000';
const port = Number(rawPort);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer from 1 to 65535');
}

const app = createApp();

const server = app.listen(port, () => {
  console.log(`Route planner API running at http://localhost:${port}`);
});

function shutDown(signal: string) {
  console.log(`Received ${signal}. Shutting down...`);

  server.close((error?: Error) => {
    if (error) {
      console.log('Shutdown error: ', error);
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => shutDown('SIGINT'));
process.on('SIGTERM', () => shutDown('SIGTERM'));
