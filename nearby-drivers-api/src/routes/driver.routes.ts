
import { Router } from "express";
import { DriverService } from "../services/driver.service";

export function createDriverRouter(
  service: DriverService
): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    const drivers = service.listDrivers();

    res.status(200).json({
      count: drivers.length,
      drivers,
    });
  });

  router.get("/:id", (req, res) => {
    const driver = service.getDriver(
      String(req.params.id)
    );

    res.status(200).json({ driver });
  });

  router.post("/", (req, res) => {
    const driver = service.createDriver(req.body);

    res.status(201).json({ driver });
  });

  router.patch("/:id", (req, res) => {
    const driver = service.updateDriver(
      String(req.params.id),
      req.body
    );

    res.status(200).json({ driver });
  });

  return router;
}
