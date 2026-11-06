
import { Router } from "express";
import {
  NearestDriverService,
  parseNearestDriverQuery,
} from "../services/nearest-driver.service";

export function createNearestDriverRouter(
  service: NearestDriverService
): Router {
  const router = Router();

  router.get("/", (req, res) => {
    const query = parseNearestDriverQuery(req.query);
    const result = service.findNearest(query);

    if (!result) {
      res.status(200).json({
        driver: null,
        message: "No available drivers found",
      });
      return;
    }

    res.status(200).json({
      driver: result.driver,
      distanceKm: Number(result.distanceKm.toFixed(3)),
    });
  });

  return router;
}
