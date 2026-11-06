
import { test } from "node:test";
import assert from "node:assert/strict";

import { findNearestDriver } from "../algorithms/nearest-driver";
import { haversineDistanceKm } from "../utils/distance";
import type { Driver } from "../models/driver.model";

function makeDriver(
  id: string,
  latitude: number,
  longitude: number,
  available = true
): Driver {
  return {
    id,
    name: `Driver ${id}`,
    latitude,
    longitude,
    available,
    updatedAt: new Date().toISOString(),
  };
}

test("Haversine returns zero for identical points", () => {
  const point = {
    latitude: 26.1445,
    longitude: 91.7362,
  };

  assert.equal(
    haversineDistanceKm(point, point),
    0
  );
});

test("Finds nearest available driver", () => {
  const drivers = [
    makeDriver("D1", 26.15, 91.74),
    makeDriver("D2", 26.1445, 91.7362),
    makeDriver("D3", 26.14, 91.73),
  ];

  const result = findNearestDriver(drivers, {
    latitude: 26.1445,
    longitude: 91.7362,
  });

  assert.equal(result?.driver.id, "D2");
  assert.equal(result?.distanceKm, 0);
});

test("Ignores unavailable drivers", () => {
  const drivers = [
    makeDriver("D1", 26.1445, 91.7362, false),
    makeDriver("D2", 26.15, 91.74, true),
  ];

  const result = findNearestDriver(drivers, {
    latitude: 26.1445,
    longitude: 91.7362,
  });

  assert.equal(result?.driver.id, "D2");
});

test("Returns null when no driver is eligible", () => {
  const drivers = [
    makeDriver("D1", 26.1445, 91.7362, false),
  ];

  const result = findNearestDriver(drivers, {
    latitude: 26.1445,
    longitude: 91.7362,
  });

  assert.equal(result, null);
});

test("Respects radius filtering", () => {
  const drivers = [
    makeDriver("D1", 26.15, 91.74),
  ];

  const result = findNearestDriver(
    drivers,
    { latitude: 0, longitude: 0 },
    { radiusKm: 1 }
  );

  assert.equal(result, null);
});

test("Breaks exact distance ties by driver ID", () => {
  const drivers = [
    makeDriver("D9", 26.1445, 91.7362),
    makeDriver("D2", 26.1445, 91.7362),
  ];

  const result = findNearestDriver(drivers, {
    latitude: 26.1445,
    longitude: 91.7362,
  });

  assert.equal(result?.driver.id, "D2");
});
