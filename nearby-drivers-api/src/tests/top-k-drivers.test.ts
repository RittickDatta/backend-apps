
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Driver } from "../models/driver.model";
import {
  topKBySorting,
  topKByHeap,
} from "../algorithms/top-k-drivers";

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
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

const pickup = {
  latitude: 26.1445,
  longitude: 91.7362,
};

const drivers = [
  makeDriver("D1", 26.1445, 91.7362),
  makeDriver("D2", 26.15, 91.74),
  makeDriver("D3", 26.14, 91.73),
  makeDriver("D4", 26.145, 91.737, false),
  makeDriver("D5", 26.16, 91.75),
  makeDriver("D6", 26.1445, 91.7362),
];

test("Sorting and heap return identical Top-K results", () => {
  const base = {
    limit: 3,
    blockedIds: ["D2"],
    contactedIds: ["D6"],
  };

  const sorted = topKBySorting(drivers, pickup, {
    ...base,
    strategy: "sort",
  });

  const heaped = topKByHeap(drivers, pickup, {
    ...base,
    strategy: "heap",
  });

  assert.deepEqual(heaped, sorted);
  assert.deepEqual(
    sorted.map((item) => item.driver.id),
    ["D1", "D3", "D5"]
  );
});

test("Excludes blocked, contacted, and unavailable drivers", () => {
  const result = topKByHeap(drivers, pickup, {
    limit: 10,
    strategy: "heap",
    blockedIds: ["D2"],
    contactedIds: ["D6"],
  });

  const ids = result.map((item) => item.driver.id);

  assert.ok(!ids.includes("D2"));
  assert.ok(!ids.includes("D4"));
  assert.ok(!ids.includes("D6"));
});

test("Breaks equal-distance ties by ID", () => {
  const result = topKByHeap(drivers, pickup, {
    limit: 2,
    strategy: "heap",
  });

  assert.deepEqual(
    result.map((item) => item.driver.id),
    ["D1", "D6"]
  );
});

test("Returns an empty array when no driver is eligible", () => {
  const result = topKBySorting(
    [makeDriver("D1", 26.1445, 91.7362, false)],
    pickup,
    { limit: 5, strategy: "sort" }
  );

  assert.deepEqual(result, []);
});

test("Respects the search radius", () => {
  const result = topKByHeap(drivers, pickup, {
    limit: 10,
    strategy: "heap",
    radiusKm: 0,
  });

  assert.deepEqual(
    result.map((item) => item.driver.id),
    ["D1", "D6"]
  );
});

test("Returns only K candidates", () => {
  const result = topKByHeap(drivers, pickup, {
    limit: 2,
    strategy: "heap",
  });

  assert.equal(result.length, 2);
});
