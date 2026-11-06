
import express, { type Express } from "express";
import { healthRouter } from "./routes/health.routes";
import { createDriverRouter } from "./routes/driver.routes";
import { createNearestDriverRouter } from "./routes/nearest-driver.routes";
import { createNearbyDriversRouter } from "./routes/nearby-drivers.routes";
import { DriverRepository } from "./repositories/driver.repository";
import { DriverService } from "./services/driver.service";
import { NearestDriverService } from "./services/nearest-driver.service";
import { NearbyDriversService } from "./services/nearby-drivers.service";
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";

export function createApp(
  repository: DriverRepository = new DriverRepository()
): Express {
  const app = express();

  const driverService = new DriverService(repository);
  const nearestService = new NearestDriverService(repository);
  const nearbyService = new NearbyDriversService(repository);

  app.use(express.json({ limit: "100kb" }));

  app.use("/health", healthRouter);

  app.use(
    "/api/drivers/nearest",
    createNearestDriverRouter(nearestService)
  );

  app.use(
    "/api/drivers/nearby",
    createNearbyDriversRouter(nearbyService)
  );

  app.use(
    "/api/drivers",
    createDriverRouter(driverService)
  );

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
