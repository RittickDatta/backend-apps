
import { performance } from "node:perf_hooks";

import { generateGrid } from "./generate-grid";
import { findFewestRoadsRoute } from "../src/algorithms/bfs";
import { findOptimalRoute } from "../src/algorithms/dijkstra";

interface BenchmarkResult {
  gridSize: number;
  intersections: number;
  roads: number;
  bfsMedianMs: number;
  dijkstraDistanceMedianMs: number;
  dijkstraTimeMedianMs: number;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function measure(
  run: () => unknown,
  iterations: number
): number {
  // Warm up the JavaScript engine.
  for (let i = 0; i < 20; i++) {
    run();
  }

  const samples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = run();
    const end = performance.now();

    if (result === null) {
      throw new Error("Benchmark route not found");
    }

    samples.push(end - start);
  }

  return median(samples);
}

function runBenchmarks(): BenchmarkResult[] {
  const sizes = [10, 25, 50, 75, 100];
  const iterations = 50;
  const results: BenchmarkResult[] = [];

  for (const size of sizes) {
    const fixture = generateGrid(size);
    const { graph, start, destination } = fixture;

    const bfsMedianMs = measure(
      () => findFewestRoadsRoute(graph, start, destination),
      iterations
    );

    const dijkstraDistanceMedianMs = measure(
      () => findOptimalRoute(
        graph,
        start,
        destination,
        "distance"
      ),
      iterations
    );

    const dijkstraTimeMedianMs = measure(
      () => findOptimalRoute(
        graph,
        start,
        destination,
        "time"
      ),
      iterations
    );

    results.push({
      gridSize: size,
      intersections: fixture.intersections,
      roads: fixture.roads,
      bfsMedianMs,
      dijkstraDistanceMedianMs,
      dijkstraTimeMedianMs,
    });
  }

  return results;
}

const results = runBenchmarks();

console.table(
  results.map(result => ({
    grid: `${result.gridSize}x${result.gridSize}`,
    intersections: result.intersections,
    roads: result.roads,
    bfsMs: result.bfsMedianMs.toFixed(3),
    dijkstraDistanceMs:
      result.dijkstraDistanceMedianMs.toFixed(3),
    dijkstraTimeMs:
      result.dijkstraTimeMedianMs.toFixed(3),
  }))
);
