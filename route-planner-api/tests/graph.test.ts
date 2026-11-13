
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";

import { createApp } from "../src/app";
import {
  GraphRepository,
  GraphError,
} from "../src/graph/graph.repository";
import { createSeededGraph } from "../src/data/seed";

describe("GraphRepository", () => {
  it("stores two-way roads in both adjacency lists", () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    graph.addRoad({
      id: "R1",
      from: "A",
      to: "B",
      distanceKm: 2,
      baseMinutes: 4,
      oneWay: false,
    });

    assert.equal(graph.getNeighbors("A")[0].intersectionId, "B");
    assert.equal(graph.getNeighbors("B")[0].intersectionId, "A");
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

    assert.equal(graph.getNeighbors("A").length, 1);
    assert.equal(graph.getNeighbors("B").length, 0);
  });

  it("rejects duplicate road IDs", () => {
    const graph = createSeededGraph();

    assert.throws(
      () => graph.addRoad({
        id: "R1",
        from: "A",
        to: "C",
        distanceKm: 2,
        baseMinutes: 4,
        oneWay: false,
      }),
      (error: unknown) =>
        error instanceof GraphError &&
        error.code === "DUPLICATE_ROAD"
    );
  });

  it("rejects invalid road weights", () => {
    const graph = createSeededGraph();

    assert.throws(
      () => graph.addRoad({
        id: "BAD",
        from: "A",
        to: "C",
        distanceKm: -2,
        baseMinutes: 4,
        oneWay: false,
      }),
      GraphError
    );
  });

  it("returns isolated snapshots", () => {
    const graph = createSeededGraph();
    const snapshot = graph.getSnapshot();

    snapshot.roads[0].distanceKm = 999;

    assert.equal(graph.getRoad("R1")?.distanceKm, 2);
  });
});

describe("Graph REST API", () => {
  it("lists seeded intersections", async () => {
    const response = await request(createApp())
      .get("/api/intersections")
      .expect(200);
    console.log("🚀 ~ response:", response)

    assert.equal(response.body.data.length, 5);
  });

  it("creates a new intersection", async () => {
    const app = createApp(new GraphRepository());

    const response = await request(app)
      .post("/api/intersections")
      .send({ id: "X", name: "Airport Road" })
      .expect(201);

    assert.equal(response.body.data.id, "X");
  });

  it("returns 409 for duplicate intersections", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/api/intersections")
      .send({ id: "A", name: "Duplicate" })
      .expect(409);

    assert.equal(
      response.body.error.code,
      "DUPLICATE_INTERSECTION"
    );
  });

  it("returns neighbors for a seeded intersection", async () => {
    const response = await request(createApp())
      .get("/api/intersections/B/neighbors")
      .expect(200);

    assert.equal(response.body.data.length, 3);
  });

  it("returns 404 for unknown intersections", async () => {
    const response = await request(createApp())
      .get("/api/intersections/UNKNOWN/neighbors")
      .expect(404);

    assert.equal(
      response.body.error.code,
      "INTERSECTION_NOT_FOUND"
    );
  });

  it("returns the full graph snapshot", async () => {
    const response = await request(createApp())
      .get("/api/graph")
      .expect(200);

    assert.equal(response.body.data.intersections.length, 5);
    assert.equal(response.body.data.roads.length, 6);
    assert.equal(response.body.data.adjacencyList.B.length, 3);
  });
});
