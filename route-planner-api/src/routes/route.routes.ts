
import { Router } from "express";

import type { GraphRepository } from "../graph/graph.repository";
import { findFewestRoadsRoute } from "../algorithms/bfs";
import {
  findOptimalRoute,
  type RouteMetric,
} from "../algorithms/dijkstra";

export function createRouteRouter(
  graph: GraphRepository
): Router {
  const router = Router();

  function validateEndpoints(
    from: unknown,
    to: unknown
  ):
    | { from: string; to: string }
    | { error: { status: number; code: string; message: string } } {
    if (
      typeof from !== "string" ||
      !from.trim() ||
      typeof to !== "string" ||
      !to.trim()
    ) {
      return {
        error: {
          status: 400,
          code: "INVALID_ROUTE_QUERY",
          message: "from and to must be non-empty strings",
        },
      };
    }

    if (!graph.getIntersection(from)) {
      return {
        error: {
          status: 404,
          code: "INTERSECTION_NOT_FOUND",
          message: `Intersection ${from} not found`,
        },
      };
    }

    if (!graph.getIntersection(to)) {
      return {
        error: {
          status: 404,
          code: "INTERSECTION_NOT_FOUND",
          message: `Intersection ${to} not found`,
        },
      };
    }

    return { from, to };
  }

  router.get("/bfs", (req, res) => {
    const validation = validateEndpoints(
      req.query.from,
      req.query.to
    );

    if ("error" in validation) {
      const { status, code, message } = validation.error;
      res.status(status).json({
        error: { code, message },
      });
      return;
    }

    const route = findFewestRoadsRoute(
      graph,
      validation.from,
      validation.to
    );

    if (!route) {
      res.status(404).json({
        error: {
          code: "ROUTE_NOT_FOUND",
          message: `No route found from ${validation.from} to ${validation.to}`,
        },
      });
      return;
    }

    res.json({ data: route });
  });

  router.get("/optimal", (req, res) => {
    const validation = validateEndpoints(
      req.query.from,
      req.query.to
    );

    if ("error" in validation) {
      const { status, code, message } = validation.error;
      res.status(status).json({
        error: { code, message },
      });
      return;
    }

    const metric = req.query.metric;

    if (metric !== "distance" && metric !== "time") {
      res.status(400).json({
        error: {
          code: "INVALID_ROUTE_QUERY",
          message: "metric must be distance or time",
        },
      });
      return;
    }

    const route = findOptimalRoute(
      graph,
      validation.from,
      validation.to,
      metric as RouteMetric
    );

    if (!route) {
      res.status(404).json({
        error: {
          code: "ROUTE_NOT_FOUND",
          message: `No route found from ${validation.from} to ${validation.to}`,
        },
      });
      return;
    }

    res.json({ data: route });
  });

  return router;
}
