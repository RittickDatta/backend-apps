
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";

import { createApp } from "../src/app";
import { findFewestRoadsRoute } from "../src/algorithms/bfs";
import { findOptimalRoute } from "../src/algorithms/dijkstra";
import { GraphRepository } from "../src/graph/graph.repository";
import { createSeededGraph } from "../src/data/seed";

describe("Dynamic graph repository", () => {
  it("updates traffic without changing road distance", () => {
    const graph = createSeededGraph();

    const updated = graph.updateTraffic("R2", 3);

    assert.equal(updated.trafficMultiplier, 3);
    assert.equal(updated.distanceKm, 3);
    assert.equal(graph.getRoad("R2")?.baseMinutes, 6);
  });

  it("rejects invalid traffic multipliers", () => {
    const app = createApp();

    return request(app)
      .patch("/api/roads/R2/traffic")
      .send({ multiplier: -1 })
      .expect(400)
      .then(response => {
        assert.equal(
          response.body.error.code,
          "INVALID_TRAFFIC_MULTIPLIER"
        );
      });
  });

  it("rejects non-boolean closure values", async () => {
    const response = await request(createApp())
      .patch("/api/roads/R2/closure")
      .send({ closed: "true" })
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_CLOSURE_STATUS"
    );
  });

  it("returns 404 for an unknown road", async () => {
    const response = await request(createApp())
      .patch("/api/roads/UNKNOWN/traffic")
      .send({ multiplier: 2 })
      .expect(404);

    assert.equal(
      response.body.error.code,
      "ROAD_NOT_FOUND"
    );
  });

  it("excludes closed roads from traversable neighbors", () => {
    const graph = createSeededGraph();

    graph.setRoadClosure("R2", true);

    const allRoadIds = graph
      .getNeighbors("B")
      .map(neighbor => neighbor.roadId);

    const traversableRoadIds = graph
      .getTraversableNeighbors("B")
      .map(neighbor => neighbor.roadId);

    assert.ok(allRoadIds.includes("R2"));
    assert.ok(!traversableRoadIds.includes("R2"));
  });
});

describe("Dynamic routing algorithms", () => {
  it("reroutes when traffic makes another path faster", () => {
    const graph = createSeededGraph();

    const before = findOptimalRoute(
      graph, "A", "C", "time"
    );

    assert.deepEqual(before?.path, ["A", "B", "C"]);
    assert.equal(before?.totalMinutes, 10);

    graph.updateTraffic("R2", 3);

    const after = findOptimalRoute(
      graph, "A", "C", "time"
    );

    assert.deepEqual(after?.path, ["A", "B", "E", "C"]);
    assert.equal(after?.totalMinutes, 14);
  });

  it("keeps distance optimization independent of traffic", () => {
    const graph = createSeededGraph();

    graph.updateTraffic("R2", 3);

    const route = findOptimalRoute(
      graph, "A", "C", "distance"
    );

    assert.deepEqual(route?.path, ["A", "B", "C"]);
    assert.equal(route?.totalDistanceKm, 5);
    assert.equal(route?.totalMinutes, 22);
  });

  it("makes BFS avoid closed roads", () => {
    const graph = createSeededGraph();

    graph.setRoadClosure("R2", true);

    const route = findFewestRoadsRoute(
      graph, "A", "C"
    );

    assert.ok(route);
    assert.ok(!route.roadIds.includes("R2"));
    assert.equal(route.roadCount, 3);
  });

  it("makes Dijkstra avoid closed roads", () => {
    const graph = createSeededGraph();

    graph.setRoadClosure("R2", true);

    const route = findOptimalRoute(
      graph, "A", "C", "distance"
    );

    assert.ok(route);
    assert.ok(!route.roadIds.includes("R2"));
    assert.deepEqual(route.path, ["A", "B", "E", "C"]);
  });

  it("restores routing when a road reopens", () => {
    const graph = createSeededGraph();

    graph.setRoadClosure("R2", true);

    assert.ok(
      !findOptimalRoute(
        graph, "A", "C", "distance"
      )?.roadIds.includes("R2")
    );

    graph.setRoadClosure("R2", false);

    const route = findOptimalRoute(
      graph, "A", "C", "distance"
    );

    assert.deepEqual(route?.path, ["A", "B", "C"]);
  });

  it("returns null when closures disconnect the graph", () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    graph.addRoad({
      id: "ONLY",
      from: "A",
      to: "B",
      distanceKm: 2,
      baseMinutes: 4,
      oneWay: false,
    });

    graph.setRoadClosure("ONLY", true);

    assert.equal(
      findFewestRoadsRoute(graph, "A", "B"),
      null
    );

    assert.equal(
      findOptimalRoute(graph, "A", "B", "time"),
      null
    );
  });
});

describe("Dynamic routing REST API", () => {
  it("updates traffic and recalculates the route", async () => {
    const app = createApp();

    await request(app)
      .patch("/api/roads/R2/traffic")
      .send({ multiplier: 3 })
      .expect(200);

    const response = await request(app)
      .get("/api/routes/optimal?from=A&to=C&metric=time")
      .expect(200);

    assert.deepEqual(
      response.body.data.path,
      ["A", "B", "E", "C"]
    );
    assert.equal(response.body.data.totalMinutes, 14);
  });

  it("closes a road and excludes it from BFS", async () => {
    const app = createApp();

    await request(app)
      .patch("/api/roads/R2/closure")
      .send({ closed: true })
      .expect(200);

    const response = await request(app)
      .get("/api/routes/bfs?from=A&to=C")
      .expect(200);

    assert.ok(
      !response.body.data.roadIds.includes("R2")
    );
  });

  it("returns updated road state", async () => {
    const app = createApp();

    await request(app)
      .patch("/api/roads/R2/traffic")
      .send({ multiplier: 2 })
      .expect(200);

    const response = await request(app)
      .get("/api/roads/R2")
      .expect(200);

    assert.equal(
      response.body.data.trafficMultiplier,
      2
    );
  });
});
