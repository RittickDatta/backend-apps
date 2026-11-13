
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";

import { createApp } from "../src/app";

describe("Route Planner API foundation", () => {
  const app = createApp();

  it("returns health status", async () => {
    const response = await request(app)
      .get("/health")
      .expect(200);

    assert.equal(response.body.status, "ok");
    assert.equal(
      response.body.service,
      "route-planner-api"
    );

    assert.ok(
      !Number.isNaN(Date.parse(response.body.timestamp))
    );
  });

  it("returns JSON for unknown routes", async () => {
    const response = await request(app)
      .get("/api/unknown")
      .expect(404);

    assert.equal(
      response.body.error.code,
      "NOT_FOUND"
    );
  });

  it("does not expose the Express header", async () => {
    const response = await request(app).get("/health");

    assert.equal(
      response.headers["x-powered-by"],
      undefined
    );
  });

  it("rejects malformed JSON", async () => {
    const response = await request(app)
      .post("/health")
      .set("Content-Type", "application/json")
      .send('{"broken":')
      .expect(500);

    assert.equal(
      response.body.error.code,
      "INTERNAL_SERVER_ERROR"
    );
  });
});
