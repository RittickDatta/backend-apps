
import { performance } from "node:perf_hooks";

import type { Driver } from "../models/driver.model";
import {
  topKBySorting,
  topKByHeap,
  type TopKOptions,
  type RankedDriver,
} from "../algorithms/top-k-drivers";

const pickup = {
  latitude: 26.1445,
  longitude: 91.7362,
};

function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function generateDrivers(count: number): Driver[] {
  const random = seededRandom(12345);

  return Array.from({ length: count }, (_, i) => ({
    id: `D${String(i).padStart(7, "0")}`,
    name: `Driver ${i}`,
    latitude: pickup.latitude + (random() - 0.5) * 0.4,
    longitude: pickup.longitude + (random() - 0.5) * 0.4,
    available: random() > 0.2,
    updatedAt: "2026-01-01T00:00:00.000Z",
  }));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

let sink = 0;

function measure(
  operation: () => RankedDriver[],
  warmups = 5,
  repetitions = 15
): number {
  for (let i = 0; i < warmups; i++) {
    sink += operation().length;
  }

  const timings: number[] = [];

  for (let i = 0; i < repetitions; i++) {
    const start = performance.now();
    const result = operation();
    const elapsed = performance.now() - start;

    sink += result.length;
    timings.push(elapsed);
  }

  return median(timings);
}

function runBenchmark(): void {
  const sizes = [100, 1000, 10000, 100000];
  const limits = [5, 50];

  console.log("Top-K Nearest Drivers Benchmark");
  console.log("Times in milliseconds (median of 15 runs)");
  console.log();

  for (const size of sizes) {
    const drivers = generateDrivers(size);

    for (const limit of limits) {
      const base: Omit<TopKOptions, "strategy"> = {
        limit,
        blockedIds: ["D0000001", "D0000002"],
        contactedIds: ["D0000003"],
      };

      const sortedResult = topKBySorting(
        drivers,
        pickup,
        { ...base, strategy: "sort" }
      );

      const heapResult = topKByHeap(
        drivers,
        pickup,
        { ...base, strategy: "heap" }
      );

      if (
        JSON.stringify(sortedResult) !==
        JSON.stringify(heapResult)
      ) {
        throw new Error(
          `Algorithm mismatch for n=${size}, k=${limit}`
        );
      }

      // Alternate which strategy runs first.
      const heapFirst = size % 2 === 0 && limit === 5;

      let sortMs: number;
      let heapMs: number;

      if (heapFirst) {
        heapMs = measure(() =>
          topKByHeap(drivers, pickup, {
            ...base,
            strategy: "heap",
          })
        );

        sortMs = measure(() =>
          topKBySorting(drivers, pickup, {
            ...base,
            strategy: "sort",
          })
        );
      } else {
        sortMs = measure(() =>
          topKBySorting(drivers, pickup, {
            ...base,
            strategy: "sort",
          })
        );

        heapMs = measure(() =>
          topKByHeap(drivers, pickup, {
            ...base,
            strategy: "heap",
          })
        );
      }

      console.log({
        drivers: size,
        k: limit,
        sortMs: Number(sortMs.toFixed(3)),
        heapMs: Number(heapMs.toFixed(3)),
        ratio: Number((sortMs / heapMs).toFixed(2)),
      });
    }
  }

  // Prevent the results from being completely unused.
  if (sink < 0) console.log(sink);
}

runBenchmark();
