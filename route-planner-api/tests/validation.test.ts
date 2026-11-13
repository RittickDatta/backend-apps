
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";

import { createApp } from "../src/app";
import { GraphRepository } from "../src/graph/graph.repository";

describe("Request validation", () => {
  it("rejects an array as a JSON body", async () => {
    const response = await request(createApp())
      .post("/api/intersections")
      .send([{ id: "X", name: "Test" }])
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_JSON_BODY"
    );
  });

  it("rejects a missing JSON body", async () => {
    const response = await request(createApp())
      .post("/api/intersections")
      .set("Content-Type", "application/json")
      .send("")
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_JSON_BODY"
    );
  });

  it("rejects a non-JSON content type", async () => {
    const response = await request(createApp())
      .post("/api/intersections")
      .set("Content-Type", "text/plain")
      .send("hello")
      .expect(415);

    assert.equal(
      response.body.error.code,
      "UNSUPPORTED_MEDIA_TYPE"
    );
  });

  it("rejects malformed JSON", async () => {
    const response = await request(createApp())
      .post("/api/intersections")
      .set("Content-Type", "application/json")
      .send('{"id":')
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_JSON"
    );
  });

  it("rejects invalid intersection IDs", async () => {
    const response = await request(createApp())
      .post("/api/intersections")
      .send({ id: "bad id", name: "Test" })
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_IDENTIFIER"
    );
  });

  it("rejects excessively long names", async () => {
    const response = await request(createApp())
      .post("/api/intersections")
      .send({
        id: "X",
        name: "a".repeat(121),
      })
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_INTERSECTION"
    );
  });

  it("rejects numeric strings as road weights", async () => {
    const response = await request(createApp())
      .post("/api/roads")
      .send({
        id: "R10",
        from: "A",
        to: "B",
        distanceKm: "5",
        baseMinutes: 10,
        oneWay: false,
      })
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_ROAD"
    );
  });

  it("rejects non-boolean oneWay values", async () => {
    const response = await request(createApp())
      .post("/api/roads")
      .send({
        id: "R10",
        from: "A",
        to: "B",
        distanceKm: 5,
        baseMinutes: 10,
        oneWay: "false",
      })
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_ROAD"
    );
  });

  it("rejects invalid route identifiers", async () => {
    const response = await request(createApp())
      .get("/api/routes/bfs?from=A&to=bad%20id")
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_ROUTE_QUERY"
    );
  });

  it("rejects invalid resource URL identifiers", async () => {
    const response = await request(createApp())
      .get("/api/intersections/bad%20id")
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_IDENTIFIER"
    );
  });

  it("returns 409 for duplicate roads", async () => {
    const response = await request(createApp())
      .post("/api/roads")
      .send({
        id: "R1",
        from: "A",
        to: "B",
        distanceKm: 2,
        baseMinutes: 4,
        oneWay: false,
      })
      .expect(409);

    assert.equal(
      response.body.error.code,
      "DUPLICATE_ROAD"
    );
  });

  it("returns 404 for a missing road", async () => {
    const response = await request(createApp())
      .get("/api/roads/UNKNOWN")
      .expect(404);

    assert.equal(
      response.body.error.code,
      "ROAD_NOT_FOUND"
    );
  });

  it("rejects a negative traffic multiplier", async () => {
    const response = await request(createApp())
      .patch("/api/roads/R1/traffic")
      .send({ multiplier: -2 })
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_TRAFFIC_MULTIPLIER"
    );
  });

  it("rejects a string closure status", async () => {
    const response = await request(createApp())
      .patch("/api/roads/R1/closure")
      .send({ closed: "true" })
      .expect(400);

    assert.equal(
      response.body.error.code,
      "INVALID_CLOSURE_STATUS"
    );
  });
});

describe("Graph state integrity", () => {
  it("does not insert a road after failed validation", () => {
    const graph = new GraphRepository();

    graph.addIntersection({ id: "A", name: "Start" });
    graph.addIntersection({ id: "B", name: "End" });

    assert.throws(() => {
      graph.addRoad({
        id: "BAD",
        from: "A",
        to: "B",
        distanceKm: -1,
        baseMinutes: 4,
        oneWay: false,
      });
    });

    assert.equal(graph.listRoads().length, 0);
    assert.equal(graph.getNeighbors("A").length, 0);
  });

  it("does not change traffic after invalid updates", () => {
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

    assert.throws(() => {
      graph.updateTraffic("R1", -5);
    });

    assert.equal(
      graph.getRoad("R1")?.trafficMultiplier,
      1
    );
  });
});
