
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Driver } from "../models/driver.model";
import {
  topKBySorting,
  topKByHeap,
} from "../algorithms/top-k-drivers";

function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test("heap matches sorting across generated datasets", () => {
  const random = seededRandom(42);

  const pickup = {
    latitude: 26.1445,
    longitude: 91.7362,
  };

  for (let trial = 0; trial < 100; trial++) {
    const size = Math.floor(random() * 150);

    const drivers: Driver[] = Array.from(
      { length: size },
      (_, i) => ({
        id: `D${String(i).padStart(5, "0")}`,
        name: `Driver ${i}`,
        latitude: pickup.latitude + (random() - 0.5) * 0.2,
        longitude: pickup.longitude + (random() - 0.5) * 0.2,
        available: random() > 0.25,
        updatedAt: "2026-01-01T00:00:00.000Z",
      })
    );

    const blockedIds = drivers
      .filter(() => random() < 0.1)
      .map((driver) => driver.id);

    const contactedIds = drivers
      .filter(() => random() < 0.1)
      .map((driver) => driver.id);

    const limit = 1 + Math.floor(random() * 20);

    const options = {
      limit,
      blockedIds,
      contactedIds,
      radiusKm: random() < 0.5 ? 5 : undefined,
    };

    const sorted = topKBySorting(drivers, pickup, {
      ...options,
      strategy: "sort",
    });

    const heaped = topKByHeap(drivers, pickup, {
      ...options,
      strategy: "heap",
    });

    assert.deepEqual(
      heaped,
      sorted,
      `Mismatch in trial ${trial}`
    );
  }
});
