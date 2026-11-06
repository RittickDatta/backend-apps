import { Router } from 'express';
import { driverService } from '../services/driver.service';

export const driverRouter = Router();

driverRouter.get('/', (_req, res) => {
  const drivers = driverService.listDrivers();

  res.status(200).json({
    count: drivers.length,
    drivers,
  });
});

driverRouter.get('/:id', (_req, res) => {
  const driver = driverService.getDriver(String(_req.params.id));

  res.status(200).json({ driver });
});

driverRouter.post('/', (req, res) => {
  const driver = driverService.createDriver(req.body);

  res.status(201).json({ driver });
});

driverRouter.patch('/:id', (req, res) => {
  const driver = driverService.updateDriver(String(req.params.id), req.body);

  res.status(200).json({ driver });
});
