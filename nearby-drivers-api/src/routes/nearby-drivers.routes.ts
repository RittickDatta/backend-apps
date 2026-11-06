
import { Router } from "express";
import {
  getNearbyDrivers,
  parseNearbyDriversQuery,
} from "../services/nearby-drivers.service";

export const nearbyDriversRouter = Router();

nearbyDriversRouter.get("/", (req, res) => {
  const query = parseNearbyDriversQuery(req.query);
  const results = getNearbyDrivers(query);

  res.status(200).json({
    count: results.length,
    strategy: query.strategy,
    drivers: results.map((result) => ({
      ...result.driver,
      distanceKm: Number(
        result.distanceKm.toFixed(3)
      ),
    })),
  });
});
