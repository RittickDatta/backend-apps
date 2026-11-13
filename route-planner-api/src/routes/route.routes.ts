
import { Router } from "express";

import type { GraphRepository } from "../graph/graph.repository";
import { findFewestRoadsRoute } from "../algorithms/bfs";

export function createRouteRouter(
  graph: GraphRepository
): Router {
  const router = Router();

  router.get("/bfs", (req, res) => {
    const { from, to } = req.query;

    if (
      typeof from !== "string" ||
      !from.trim() ||
      typeof to !== "string" ||
      !to.trim()
    ) {
      res.status(400).json({
        error: {
          code: "INVALID_ROUTE_QUERY",
          message: "from and to must be non-empty strings",
        },
      });
      return;
    }

    if (!graph.getIntersection(from)) {
      res.status(404).json({
        error: {
          code: "INTERSECTION_NOT_FOUND",
          message: `Intersection ${from} not found`,
        },
      });
      return;
    }

    if (!graph.getIntersection(to)) {
      res.status(404).json({
        error: {
          code: "INTERSECTION_NOT_FOUND",
          message: `Intersection ${to} not found`,
        },
      });
      return;
    }

    const route = findFewestRoadsRoute(
      graph,
      from,
      to
    );

    if (!route) {
      res.status(404).json({
        error: {
          code: "ROUTE_NOT_FOUND",
          message: `No route found from ${from} to ${to}`,
        },
      });
      return;
    }

    res.json({ data: route });
  });

  return router;
}
