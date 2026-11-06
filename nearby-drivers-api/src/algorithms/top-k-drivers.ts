
import type { Driver } from "../models/driver.model";
import {
  haversineDistanceKm,
  type Coordinates,
} from "../utils/distance";
import { MaxHeap } from "./max-heap";

export interface RankedDriver {
  driver: Driver;
  distanceKm: number;
}

export interface TopKOptions {
  limit: number;
  strategy: "sort" | "heap";
  radiusKm?: number;
  blockedIds?: readonly string[];
  contactedIds?: readonly string[];
}

// Negative: a should appear before b.
function compareNearestFirst(
  a: RankedDriver,
  b: RankedDriver
): number {
  return (
    a.distanceKm - b.distanceKm ||
    a.driver.id.localeCompare(b.driver.id)
  );
}

function* eligibleCandidates(
  drivers: readonly Driver[],
  pickup: Coordinates,
  options: TopKOptions
): Generator<RankedDriver> {
  const blocked = new Set(options.blockedIds ?? []);
  const contacted = new Set(options.contactedIds ?? []);

  for (const driver of drivers) {
    if (!driver.available) continue;
    if (blocked.has(driver.id)) continue;
    if (contacted.has(driver.id)) continue;

    const distanceKm = haversineDistanceKm(
      pickup,
      driver
    );

    if (
      options.radiusKm !== undefined &&
      distanceKm > options.radiusKm
    ) {
      continue;
    }

    yield { driver, distanceKm };
  }
}

export function topKBySorting(
  drivers: readonly Driver[],
  pickup: Coordinates,
  options: TopKOptions
): RankedDriver[] {
  if (options.limit <= 0) return [];

  const candidates = [
    ...eligibleCandidates(drivers, pickup, options),
  ];

  return candidates
    .sort(compareNearestFirst)
    .slice(0, options.limit);
}

export function topKByHeap(
  drivers: readonly Driver[],
  pickup: Coordinates,
  options: TopKOptions
): RankedDriver[] {
  if (options.limit <= 0) return [];

  // Higher priority = farther away, or larger ID
  // when distances are equal.
  const heap = new MaxHeap<RankedDriver>(
    compareNearestFirst
  );

  for (const candidate of eligibleCandidates(
    drivers,
    pickup,
    options
  )) {
    if (heap.size < options.limit) {
      heap.push(candidate);
      continue;
    }

    const farthest = heap.peek()!;

    if (compareNearestFirst(candidate, farthest) < 0) {
      heap.pop();
      heap.push(candidate);
    }
  }

  return heap.toArray().sort(compareNearestFirst);
}

export function findTopKDrivers(
  drivers: readonly Driver[],
  pickup: Coordinates,
  options: TopKOptions
): RankedDriver[] {
  return options.strategy === "heap"
    ? topKByHeap(drivers, pickup, options)
    : topKBySorting(drivers, pickup, options);
}
