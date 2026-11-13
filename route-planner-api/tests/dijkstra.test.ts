
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";

import { createApp } from "../src/app";
import { MinHeap } from "../src/algorithms/min-heap";
import { findOptimalRoute } from "../src/algorithms/dijkstra";
import { GraphRepository } from "../src/graph/graph.repository";
import { createSeededGraph } from "../src/data/seed";

function createMetricTestGraph(): GraphRepository {
  const graph = new GraphRepository();

  for (const id of ["A", "B", "C"]) {
    graph.addIntersection({ id, name: id });
  }

  graph.addRoad({
    id: "DIRECT",
    from: "A",
    to: "C",
    distanceKm: 12,
    baseMinutes: 10,
    oneWay: false,
  });

  graph.addRoad({
    id: "AB",
    from: "A",
    to: "B",
    distanceKm: 3,
    baseMinutes: 5,
    oneWay: false,
  });

  graph.addRoad({
    id: "BC",
    from: "B",
    to: "C",
    distanceKm: 4,
    baseMinutes: 8,
    oneWay: false,
  });

  return graph;
}

describe("MinHeap", () => {
  it("removes items in ascending priority order", () => {
    const heap = new MinHeap<string>();

    heap.push("slow", 12);
    heap.push("fast", 2);
    heap.push("medium", 5);

    assert.equal(heap.size, 3);
    assert.equal(heap.pop()?.value, "fast");
    assert.equal(heap.pop()?.value, "medium");
    assert.equal(heap.pop()?.value, "slow");
    assert.equal(heap.pop(), null);
  });

  it("rejects invalid priorities", () => {
    const heap = new MinHeap<string>();

    assert.throws(() => heap.push("bad", Infinity));
    assert.throws(() => heap.push("bad", NaN));
  });
});

describe("Dijkstra routing algorithm", () => {
  it("finds the shortest route in the seeded graph", () => {
    const result = findOptimalRoute(
      createSeededGraph(),
      "A",
      "C",
      "distance"
    );

    assert.deepEqual(result, {
      path: ["A", "B", "C"],
      roadIds: ["R1", "R2"],
      metric: "distance",
      totalCost: 5,
      totalDistanceKm: 5,
      totalMinutes: 10,
    });
  });

  it("chooses different routes for distance and time", () => {
    const graph = createMetricTestGraph();

    const shortest = findOptimalRoute(
      graph,
      "A",
      "C",
      "distance"
    );

    const fastest = findOptimalRoute(
      graph,
      "A",
      "C",
      "time"
    );

    assert.deepEqual(shortest?.path, ["A", "B", "C"]);
    assert.equal(shortest?.totalDistanceKm, 7);
    assert.equal(shortest?.totalMinutes, 13);

    assert.deepEqual(fastest?.path, ["A", "C"]);
    assert.equal(fastest?.totalDistanceKm, 12);
    assert.equal(fastest?.totalMinutes, 10);
  });

  it("handles the same start and destination", () => {
    const result = findOptimalRoute(
      createSeededGraph(),
      "A",
      "A",
      "distance"
    );

    assert.deepEqual(result, {
      path: ["A"],
      roadIds: [],
      metric: "distance",
      totalCost: 0,
      totalDistanceKm: 0,
      totalMinutes: 0,
    });
  });

  it("returns null for disconnected intersections", () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    assert.equal(
      findOptimalRoute(graph, "A", "B", "distance"),
      null
    );
  });

  it("respects one-way roads", () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    graph.addRoad({
      id: "ONE_WAY",
      from: "A",
      to: "B",
      distanceKm: 2,
      baseMinutes: 4,
      oneWay: true,
    });

    assert.deepEqual(
      findOptimalRoute(graph, "A", "B", "distance")?.path,
      ["A", "B"]
    );

    assert.equal(
      findOptimalRoute(graph, "B", "A", "distance"),
      null
    );
  });

  it("selects the cheaper of parallel roads", () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    graph.addRoad({
      id: "EXPENSIVE",
      from: "A",
      to: "B",
      distanceKm: 10,
      baseMinutes: 3,
      oneWay: false,
    });

    graph.addRoad({
      id: "CHEAP",
      from: "A",
      to: "B",
      distanceKm: 2,
      baseMinutes: 8,
      oneWay: false,
    });

    assert.deepEqual(
      findOptimalRoute(graph, "A", "B", "distance")?.roadIds,
      ["CHEAP"]
    );

    assert.deepEqual(
      findOptimalRoute(graph, "A", "B", "time")?.roadIds,
      ["EXPENSIVE"]
    );
  });
});

describe("Optimal routing REST API", () => {
  it("returns a distance-optimized route", async () => {
    const response = await request(createApp())
      .get("/api/routes/optimal?from=A&to=C&metric=distance")
      .expect(200);

    assert.deepEqual(
      response.body.data.path,
      ["A", "B", "C"]
    );

    assert.equal(response.body.data.totalCost, 5);
  });

  it("returns a time-optimized route", async () => {
    const response = await request(
      createApp(createMetricTestGraph())
    )
      .get("/api/routes/optimal?from=A&to=C&metric=time")
      .expect(200);

    assert.deepEqual(
      response.body.data.path,
      ["A", "C"]
    );

    assert.equal(response.body.data.totalCost, 10);
  });

  it("rejects an invalid metric", async () => {
    const response = await request(createApp())
      .get("/api/routes/optimal?from=A&to=C&metric=price")
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_ROUTE_QUERY"
    );
  });

  it("rejects missing query parameters", async () => {
    await request(createApp())
      .get("/api/routes/optimal?from=A&metric=time")
      .expect(400);
  });

  it("returns 404 for unknown intersections", async () => {
    const response = await request(createApp())
      .get("/api/routes/optimal?from=A&to=UNKNOWN&metric=time")
      .expect(404);

    assert.equal(
      response.body.error.code,
      "INTERSECTION_NOT_FOUND"
    );
  });

  it("returns 404 when no route exists", async () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    const response = await request(createApp(graph))
      .get("/api/routes/optimal?from=A&to=B&metric=time")
      .expect(404);

    assert.equal(
      response.body.error.code,
      "ROUTE_NOT_FOUND"
    );
  });
});
