import { Router } from 'express';
import {
  getNearestAvailableDriver,
  parseNearestDriverQuery,
} from '../services/nearest-driver.service';

export const nearestDriverRouter = Router();

nearestDriverRouter.get('/', (req, res) => {
  const query = parseNearestDriverQuery(req.query);

  const result = getNearestAvailableDriver(query);

  if (!result) {
    res.status(200).json({
      driver: null,
      message: 'No available drivers found',
    });
    return;
  }

  res.status(200).json({
    driver: result.driver,
    distanceKm: Number(result.distanceKm.toFixed(3)),
  });
});
