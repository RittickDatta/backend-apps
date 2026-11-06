
import { Router } from "express";
import {
  NearbyDriversService,
  parseNearbyDriversQuery,
} from "../services/nearby-drivers.service";

export function createNearbyDriversRouter(
  service: NearbyDriversService
): Router {
  const router = Router();

  router.get("/", (req, res) => {
    const query = parseNearbyDriversQuery(req.query);
    const results = service.findNearby(query);

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

  return router;
}
