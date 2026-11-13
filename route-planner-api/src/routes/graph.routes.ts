import { Router } from 'express';
import type { GraphRepository } from '../graph/graph.repository';

export function createGraphRouter(graph: GraphRepository): Router {
  const router = Router();

  router.post('/intersections', (req, res) => {
    const intersection = graph.addIntersection(req.body);
    res.status(201).json({ data: intersection });
  });

  router.get('/intersections', (_req, res) => {
    res.json({ data: graph.listIntersections() });
  });

  router.get('/intersections/:id', (req, res) => {
    const intersection = graph.getIntersection(req.params.id);

    if (!intersection) {
      res.status(404).json({
        error: {
          code: 'INTERSECTION_NOT_FOUND',
          message: `Intersection ${req.params.id} not found`,
        },
      });
      return;
    }

    res.json({ data: intersection });
  });

  router.get('/intersections/:id/neighbors', (req, res) => {
    const neighbors = graph.getNeighbors(req.params.id);
    res.json({ data: neighbors });
  });

  router.post('/roads', (req, res) => {
    const road = graph.addRoad(req.body);
    res.status(201).json({ data: road });
  });

  router.get('/roads', (_req, res) => {
    res.json({ data: graph.listRoads() });
  });

  router.get('/roads/:id', (req, res) => {
    const road = graph.getRoad(req.params.id);

    if (!road) {
      res.status(404).json({
        error: {
          code: 'ROAD_NOT_FOUND',
          message: `Road ${req.params.id} not found`,
        },
      });
      return;
    }

    res.json({ data: road });
  });

  router.get('/graph', (_req, res) => {
    res.json({ data: graph.getSnapshot() });
  });

  return router;
}
