import express from 'express';
import { healthRouter } from './routes/health.routes';
import { nearestDriverRouter } from './routes/nearest-driver.routes';
import { nearbyDriversRouter } from './routes/nearby-drivers.routes';
import { driverRouter } from './routes/driver.routes';

import { notFound } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';

export const app = express();

app.use(express.json({ limit: '100kb' }));

app.use('/health', healthRouter);

app.use('/api/drivers/nearest', nearestDriverRouter);
app.use('/api/drivers/nearby', nearbyDriversRouter);

app.use('/api/drivers', driverRouter);

app.use(notFound);

app.use(errorHandler);
