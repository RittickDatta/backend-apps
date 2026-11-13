
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";

import { createApp } from "../src/app";
import { findFewestRoadsRoute } from "../src/algorithms/bfs";
import { GraphRepository } from "../src/graph/graph.repository";
import { createSeededGraph } from "../src/data/seed";

describe("BFS routing algorithm", () => {
  it("finds the fewest-road route in the seeded graph", () => {
    const graph = createSeededGraph();

    assert.deepEqual(
      findFewestRoadsRoute(graph, "A", "C"),
      {
        path: ["A", "B", "C"],
        roadIds: ["R1", "R2"],
        roadCount: 2,
      }
    );
  });

  it("handles the same start and destination", () => {
    const graph = createSeededGraph();

    assert.deepEqual(
      findFewestRoadsRoute(graph, "A", "A"),
      {
        path: ["A"],
        roadIds: [],
        roadCount: 0,
      }
    );
  });

  it("returns null for disconnected intersections", () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    assert.equal(
      findFewestRoadsRoute(graph, "A", "B"),
      null
    );
  });

  it("respects one-way road direction", () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    graph.addRoad({
      id: "R1",
      from: "A",
      to: "B",
      distanceKm: 2,
      baseMinutes: 4,
      oneWay: true,
    });

    assert.deepEqual(
      findFewestRoadsRoute(graph, "A", "B")?.path,
      ["A", "B"]
    );

    assert.equal(
      findFewestRoadsRoute(graph, "B", "A"),
      null
    );
  });

  it("does not loop infinitely on cycles", () => {
    const graph = createSeededGraph();

    const result = findFewestRoadsRoute(
      graph,
      "D",
      "C"
    );

    assert.ok(result);
    assert.equal(result.roadCount, 2);
  });
});

describe("BFS REST API", () => {
  it("returns a valid route", async () => {
    const response = await request(createApp())
      .get("/api/routes/bfs?from=A&to=C")
      .expect(200);

    assert.deepEqual(
      response.body.data.path,
      ["A", "B", "C"]
    );

    assert.equal(response.body.data.roadCount, 2);
  });

  it("rejects missing query parameters", async () => {
    const response = await request(createApp())
      .get("/api/routes/bfs?from=A")
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_ROUTE_QUERY"
    );
  });

  it("returns 404 for unknown intersections", async () => {
    const response = await request(createApp())
      .get("/api/routes/bfs?from=A&to=UNKNOWN")
      .expect(404);

    assert.equal(
      response.body.error.code,
      "INTERSECTION_NOT_FOUND"
    );
  });

  it("returns 404 for unreachable destinations", async () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    const response = await request(createApp(graph))
      .get("/api/routes/bfs?from=A&to=B")
      .expect(404);

    assert.equal(
      response.body.error.code,
      "ROUTE_NOT_FOUND"
    );
  });
});
