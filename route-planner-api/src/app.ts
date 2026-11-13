
import express from "express";

import { GraphRepository } from "./graph/graph.repository";
import { createSeededGraph } from "./data/seed";
import { createGraphRouter } from "./routes/graph.routes";
import { healthRouter } from "./routes/health.routes";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler";

export function createApp(
  graph: GraphRepository = createSeededGraph()
) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.use("/health", healthRouter);
  app.use("/api", createGraphRouter(graph));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
