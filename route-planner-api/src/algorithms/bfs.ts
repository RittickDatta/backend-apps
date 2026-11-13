
import type { GraphRepository } from "../graph/graph.repository";

export interface BfsRouteResult {
  path: string[];
  roadIds: string[];
  roadCount: number;
}

interface ParentInfo {
  previous: string;
  roadId: string;
}

export function findFewestRoadsRoute(
  graph: GraphRepository,
  start: string,
  destination: string
): BfsRouteResult | null {
  // The API layer validates whether intersections exist.
  if (
    !graph.getIntersection(start) ||
    !graph.getIntersection(destination)
  ) {
    return null;
  }

  if (start === destination) {
    return {
      path: [start],
      roadIds: [],
      roadCount: 0,
    };
  }

  const queue: string[] = [start];
  let head = 0;

  const visited = new Set<string>([start]);
  const parent = new Map<string, ParentInfo>();

  while (head < queue.length) {
    const current = queue[head++];

    for (const neighbor of graph.getTraversableNeighbors(current)) {
      const next = neighbor.intersectionId;

      if (visited.has(next)) continue;

      visited.add(next);

      parent.set(next, {
        previous: current,
        roadId: neighbor.roadId,
      });

      // Stop when the destination is first discovered.
      if (next === destination) {
        return reconstructRoute(
          parent,
          start,
          destination
        );
      }

      queue.push(next);
    }
  }

  return null;
}

function reconstructRoute(
  parent: Map<string, ParentInfo>,
  start: string,
  destination: string
): BfsRouteResult {
  const path: string[] = [];
  const roadIds: string[] = [];

  let current = destination;

  while (current !== start) {
    path.push(current);

    const info = parent.get(current);

    if (!info) {
      throw new Error("Cannot reconstruct BFS route");
    }

    roadIds.push(info.roadId);
    current = info.previous;
  }

  path.push(start);

  path.reverse();
  roadIds.reverse();

  return {
    path,
    roadIds,
    roadCount: roadIds.length,
  };
}
