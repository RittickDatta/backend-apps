
export interface Intersection {
  id: string;
  name: string;
}

export interface Road {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  baseMinutes: number;
  oneWay: boolean;
  trafficMultiplier: number;
  closed: boolean;
}

export interface CreateRoadInput {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  baseMinutes: number;
  oneWay: boolean;
}

export interface Neighbor {
  intersectionId: string;
  roadId: string;
  distanceKm: number;
  baseMinutes: number;
}

export interface GraphSnapshot {
  intersections: Intersection[];
  roads: Road[];
  adjacencyList: Record<string, Neighbor[]>;
}
