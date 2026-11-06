import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'nearby-drivers-api',
    timestamp: new Date().toISOString(),
  });
});
