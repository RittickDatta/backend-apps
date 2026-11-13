import type {
  CreateRoadInput,
  GraphSnapshot,
  Intersection,
  Neighbor,
  Road,
} from './graph.types';

export class GraphError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'GraphError';
  }
}

function requireId(value: unknown, field: string): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(value)) {
    throw new GraphError(
      400,
      'INVALID_IDENTIFIER',
      `${field} must contain 1–64 letters, numbers, _ or -`,
    );
  }

  return value;
}

function requirePositiveNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new GraphError(
      400,
      'INVALID_ROAD',
      `${field} must be a positive finite number`,
    );
  }

  return value;
}

function requireNonEmptyName(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 120) {
    throw new GraphError(
      400,
      'INVALID_INTERSECTION',
      'name must be a non-empty string of at most 120 characters',
    );
  }

  return value.trim();
}

export class GraphRepository {
  private readonly intersections = new Map<string, Intersection>();

  private readonly roads = new Map<string, Road>();

  private readonly adjacency = new Map<string, Neighbor[]>();

  addIntersection(input: Intersection): Intersection {
    const id = requireId(input.id, 'id');
    const name = requireNonEmptyName(input.name);

    if (this.intersections.has(id)) {
      throw new GraphError(
        409,
        'DUPLICATE_INTERSECTION',
        `Intersection ${id} already exists`,
      );
    }

    const intersection = { id, name };

    this.intersections.set(id, intersection);
    this.adjacency.set(id, []);

    return { ...intersection };
  }

  getIntersection(id: string): Intersection | null {
    const intersection = this.intersections.get(id);
    return intersection ? { ...intersection } : null;
  }

  listIntersections(): Intersection[] {
    return Array.from(this.intersections.values(), (item) => ({ ...item }));
  }

  addRoad(input: CreateRoadInput): Road {
    const id = requireId(input.id, 'id');
    const from = requireId(input.from, 'from');
    const to = requireId(input.to, 'to');

    const distanceKm = requirePositiveNumber(input.distanceKm, 'distanceKm');

    const baseMinutes = requirePositiveNumber(input.baseMinutes, 'baseMinutes');

    if (typeof input.oneWay !== 'boolean') {
      throw new GraphError(400, 'INVALID_ROAD', 'oneWay must be a boolean');
    }

    if (from === to) {
      throw new GraphError(
        400,
        'INVALID_ROAD',
        'A road cannot connect an intersection to itself',
      );
    }

    if (this.roads.has(id)) {
      throw new GraphError(409, 'DUPLICATE_ROAD', `Road ${id} already exists`);
    }

    if (!this.intersections.has(from) || !this.intersections.has(to)) {
      throw new GraphError(
        404,
        'INTERSECTION_NOT_FOUND',
        'Both intersections must exist before adding a road',
      );
    }

    const road: Road = {
      id,
      from,
      to,
      distanceKm,
      baseMinutes,
      oneWay: input.oneWay,
      trafficMultiplier: 1,
      closed: false,
    };

    this.roads.set(id, road);

    this.adjacency.get(from)!.push({
      intersectionId: to,
      roadId: id,
      distanceKm,
      baseMinutes,
    });

    if (!road.oneWay) {
      this.adjacency.get(to)!.push({
        intersectionId: from,
        roadId: id,
        distanceKm,
        baseMinutes,
      });
    }

    return { ...road };
  }

  getRoad(id: string): Road | null {
    const road = this.roads.get(id);
    return road ? { ...road } : null;
  }

  updateTraffic(roadId: string, multiplier: number): Road {
    if (
      typeof multiplier !== 'number' ||
      !Number.isFinite(multiplier) ||
      multiplier < 1 ||
      multiplier > 20
    ) {
      throw new GraphError(
        400,
        'INVALID_TRAFFIC_MULTIPLIER',
        'Traffic multiplier must be between 1 and 20',
      );
    }

    const road = this.roads.get(roadId);

    if (!road) {
      throw new GraphError(404, 'ROAD_NOT_FOUND', `Road ${roadId} not found`);
    }

    road.trafficMultiplier = multiplier;

    return { ...road };
  }

  setRoadClosure(roadId: string, closed: boolean): Road {
    if (typeof closed !== 'boolean') {
      throw new GraphError(
        400,
        'INVALID_CLOSURE_STATUS',
        'closed must be a boolean',
      );
    }

    const road = this.roads.get(roadId);

    if (!road) {
      throw new GraphError(404, 'ROAD_NOT_FOUND', `Road ${roadId} not found`);
    }

    road.closed = closed;

    return { ...road };
  }

  getTraversableNeighbors(id: string): Neighbor[] {
    const neighbors = this.getNeighbors(id);

    return neighbors.filter((neighbor) => {
      const road = this.roads.get(neighbor.roadId);

      return road !== undefined && !road.closed;
    });
  }

  listRoads(): Road[] {
    return Array.from(this.roads.values(), (road) => ({ ...road }));
  }

  getNeighbors(id: string): Neighbor[] {
    const neighbors = this.adjacency.get(id);

    if (!neighbors) {
      throw new GraphError(
        404,
        'INTERSECTION_NOT_FOUND',
        `Intersection ${id} not found`,
      );
    }

    return neighbors.map((neighbor) => ({ ...neighbor }));
  }

  getSnapshot(): GraphSnapshot {
    const adjacencyList: Record<string, Neighbor[]> = Object.create(null);

    for (const id of this.intersections.keys()) {
      adjacencyList[id] = this.getNeighbors(id);
    }

    return {
      intersections: this.listIntersections(),
      roads: this.listRoads(),
      adjacencyList,
    };
  }
}
