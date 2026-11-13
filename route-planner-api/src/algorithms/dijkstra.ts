import type { GraphRepository } from '../graph/graph.repository';
import { MinHeap } from './min-heap';

export type RouteMetric = 'distance' | 'time';

export interface OptimalRouteResult {
  path: string[];
  roadIds: string[];
  metric: RouteMetric;
  totalCost: number;
  totalDistanceKm: number;
  totalMinutes: number;
}

interface ParentInfo {
  previous: string;
  roadId: string;
}

export function findOptimalRoute(
  graph: GraphRepository,
  start: string,
  destination: string,
  metric: RouteMetric,
): OptimalRouteResult | null {
  if (!graph.getIntersection(start) || !graph.getIntersection(destination)) {
    return null;
  }

  const distances = new Map<string, number>();
  const parents = new Map<string, ParentInfo>();
  const heap = new MinHeap<string>();

  distances.set(start, 0);
  heap.push(start, 0);

  while (heap.size > 0) {
    const current = heap.pop()!;
    const currentNode = current.value;
    const currentCost = current.priority;

    // Ignore outdated heap entries.
    if (currentCost > (distances.get(currentNode) ?? Infinity)) {
      continue;
    }

    if (currentNode === destination) {
      break;
    }

    for (const neighbor of graph.getTraversableNeighbors(currentNode)) {
      const road = graph.getRoad(neighbor.roadId);

      if (!road) {
        throw new Error(`Road ${neighbor.roadId} not found during routing`);
      }

      const edgeCost =
        metric === 'distance'
          ? road.distanceKm
          : road.baseMinutes * road.trafficMultiplier;

      const candidateCost = currentCost + edgeCost;
      const knownCost = distances.get(neighbor.intersectionId) ?? Infinity;

      if (candidateCost < knownCost) {
        distances.set(neighbor.intersectionId, candidateCost);

        parents.set(neighbor.intersectionId, {
          previous: currentNode,
          roadId: neighbor.roadId,
        });

        heap.push(neighbor.intersectionId, candidateCost);
      }
    }
  }

  const totalCost = distances.get(destination);

  if (totalCost === undefined) {
    return null;
  }

  const path: string[] = [];
  const roadIds: string[] = [];

  let currentNode = destination;

  while (currentNode !== start) {
    path.push(currentNode);

    const info = parents.get(currentNode);

    if (!info) {
      throw new Error('Cannot reconstruct Dijkstra route');
    }

    roadIds.push(info.roadId);
    currentNode = info.previous;
  }

  path.push(start);
  path.reverse();
  roadIds.reverse();

  let totalDistanceKm = 0;
  let totalMinutes = 0;

  for (const roadId of roadIds) {
    const road = graph.getRoad(roadId);

    if (!road) {
      throw new Error(`Road ${roadId} disappeared during routing`);
    }

    totalDistanceKm += road.distanceKm;
    totalMinutes += road.baseMinutes * road.trafficMultiplier;
  }

  return {
    path,
    roadIds,
    metric,
    totalCost,
    totalDistanceKm,
    totalMinutes,
  };
}
