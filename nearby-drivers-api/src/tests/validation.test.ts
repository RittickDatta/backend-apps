
import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app";
import { DriverRepository } from "../repositories/driver.repository";
import { withTestServer } from "./helpers/test-server";

test("invalid geographic queries return 400", async () => {
  const app = createApp(new DriverRepository([]));

  await withTestServer(app, async (baseUrl) => {
    const invalidQueries = [
      "lat=91&lng=0",
      "lat=0&lng=181",
      "lat=abc&lng=0",
      "lat=0",
      "lng=0",
      "lat=0&lng=0&radiusKm=-1",
      "lat=0&lng=0&radiusKm=NaN",
      "lat=0&lng=0&lat=1",
    ];

    for (const query of invalidQueries) {
      const response = await fetch(
        `${baseUrl}/api/drivers/nearest?${query}`
      );

      assert.equal(
        response.status,
        400,
        `Expected 400 for ${query}`
      );
    }
  });
});

test("invalid driver payloads return 400", async () => {
  const app = createApp(new DriverRepository([]));

  await withTestServer(app, async (baseUrl) => {
    const invalidBodies = [
      {},
      { id: "D1", name: "", latitude: 0, longitude: 0 },
      { id: "D1", name: "A", latitude: "0", longitude: 0 },
      { id: "D1", name: "A", latitude: 0, longitude: 181 },
      { id: "D1", name: "A", latitude: 0, longitude: 0, available: "yes" },
      { id: "D1", name: "A", latitude: 0, longitude: 0, unexpected: true },
    ];

    for (const body of invalidBodies) {
      const response = await fetch(
        `${baseUrl}/api/drivers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      assert.equal(response.status, 400);
    }
  });
});

test("malformed JSON returns structured 400", async () => {
  const app = createApp(new DriverRepository([]));

  await withTestServer(app, async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: '{"id":',
      }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "INVALID_JSON");
  });
});

test("empty dataset returns no nearby drivers", async () => {
  const app = createApp(new DriverRepository([]));

  await withTestServer(app, async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/nearby` +
      "?lat=26.1445&lng=91.7362&limit=5"
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.count, 0);
    assert.deepEqual(body.drivers, []);
  });
});
