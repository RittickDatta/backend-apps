
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";

import { createApp } from "../src/app";
import { findFewestRoadsRoute } from "../src/algorithms/bfs";
import { findOptimalRoute } from "../src/algorithms/dijkstra";
import { GraphRepository } from "../src/graph/graph.repository";
import { createSeededGraph } from "../src/data/seed";

describe("Routing regression tests", () => {
  it("handles cycles without repeating intersections", () => {
    const graph = createSeededGraph();

    const bfs = findFewestRoadsRoute(graph, "A", "C");
    const optimal = findOptimalRoute(
      graph, "A", "C", "distance"
    );

    assert.ok(bfs);
    assert.ok(optimal);

    assert.equal(
      new Set(bfs.path).size,
      bfs.path.length
    );

    assert.equal(
      new Set(optimal.path).size,
      optimal.path.length
    );
  });

  it("returns zero cost for the same intersection", () => {
    const result = findOptimalRoute(
      createSeededGraph(),
      "A",
      "A",
      "time"
    );

    assert.deepEqual(result?.path, ["A"]);
    assert.equal(result?.totalCost, 0);
    assert.equal(result?.totalMinutes, 0);
  });

  it("returns null when closures disconnect a route", () => {
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

    graph.setRoadClosure("R1", true);

    assert.equal(
      findFewestRoadsRoute(graph, "A", "B"),
      null
    );

    assert.equal(
      findOptimalRoute(graph, "A", "B", "time"),
      null
    );
  });

  it("handles parallel roads with different weights", () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    graph.addRoad({
      id: "SHORT",
      from: "A",
      to: "B",
      distanceKm: 1,
      baseMinutes: 20,
      oneWay: false,
    });

    graph.addRoad({
      id: "FAST",
      from: "A",
      to: "B",
      distanceKm: 5,
      baseMinutes: 3,
      oneWay: false,
    });

    assert.deepEqual(
      findOptimalRoute(graph, "A", "B", "distance")?.roadIds,
      ["SHORT"]
    );

    assert.deepEqual(
      findOptimalRoute(graph, "A", "B", "time")?.roadIds,
      ["FAST"]
    );
  });

  it("does not allow travel against a one-way road", () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    graph.addRoad({
      id: "R1",
      from: "A",
      to: "B",
      distanceKm: 1,
      baseMinutes: 2,
      oneWay: true,
    });

    assert.equal(
      findOptimalRoute(graph, "B", "A", "distance"),
      null
    );
  });
});

describe("Express application isolation", () => {
  it("keeps traffic updates isolated between app instances", async () => {
    const firstApp = createApp();
    const secondApp = createApp();

    await request(firstApp)
      .patch("/api/roads/R2/traffic")
      .send({ multiplier: 4 })
      .expect(200);

    const firstResponse = await request(firstApp)
      .get("/api/roads/R2")
      .expect(200);

    const secondResponse = await request(secondApp)
      .get("/api/roads/R2")
      .expect(200);

    assert.equal(
      firstResponse.body.data.trafficMultiplier,
      4
    );

    assert.equal(
      secondResponse.body.data.trafficMultiplier,
      1
    );
  });

  it("keeps intersection creation isolated", async () => {
    const firstApp = createApp();
    const secondApp = createApp();

    await request(firstApp)
      .post("/api/intersections")
      .send({ id: "X", name: "New Junction" })
      .expect(201);

    await request(firstApp)
      .get("/api/intersections/X")
      .expect(200);

    await request(secondApp)
      .get("/api/intersections/X")
      .expect(404);
  });
});
