import { Router } from 'express';
import type { GraphRepository } from '../graph/graph.repository';
import { requireJsonObject } from '../middleware/validate-json';
import { validateId } from '../middleware/validate-id';

export function createGraphRouter(graph: GraphRepository): Router {
  const router = Router();

  router.post('/intersections', requireJsonObject, (req, res) => {
    const intersection = graph.addIntersection(req.body);
    res.status(201).json({ data: intersection });
  });

  router.get('/intersections', (_req, res) => {
    res.json({ data: graph.listIntersections() });
  });

  router.get<{id: string}>('/intersections/:id', validateId, (req, res) => {
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

  router.get<{id: string}>('/intersections/:id/neighbors',validateId, (req, res) => {
    const neighbors = graph.getNeighbors(req.params.id);
    res.json({ data: neighbors });
  });

  router.post('/roads', requireJsonObject, (req, res) => {
    const road = graph.addRoad(req.body);
    res.status(201).json({ data: road });
  });

  router.get('/roads', (_req, res) => {
    res.json({ data: graph.listRoads() });
  });

  router.get<{id: string}>('/roads/:id/status', validateId, (req, res) => {
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

    res.json({
      data: {
        roadId: road.id,
        distanceKm: road.distanceKm,
        baseMinutes: road.baseMinutes,
        trafficMultiplier: road.trafficMultiplier,
        estimatedMinutes: road.closed
          ? null
          : road.baseMinutes * road.trafficMultiplier,
        closed: road.closed,
      },
    });
  });

  router.get<{id: string}>('/roads/:id', validateId, (req, res) => {
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

  router.patch<{id: string}>('/roads/:id/traffic', validateId, requireJsonObject, (req, res) => {
    const { multiplier } = req.body ?? {};

    const road = graph.updateTraffic(req.params.id, multiplier);

    res.json({
      data: road,
      message: 'Traffic updated successfully',
    });
  });

  router.patch<{id: string}>('/roads/:id/closure', validateId, requireJsonObject, (req, res) => {
    const { closed } = req.body ?? {};

    const road = graph.setRoadClosure(req.params.id, closed);

    res.json({
      data: road,
      message: closed
        ? 'Road closed successfully'
        : 'Road reopened successfully',
    });
  });

  return router;
}
