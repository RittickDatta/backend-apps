
import { test } from "node:test";
import assert from "node:assert/strict";

import { createApp } from "../app";
import { DriverRepository } from "../repositories/driver.repository";
import type { Driver } from "../models/driver.model";
import { withTestServer } from "./helpers/test-server";

const timestamp = "2026-01-01T00:00:00.000Z";

function driver(
  id: string,
  latitude: number,
  longitude: number,
  available = true
): Driver {
  return {
    id,
    name: `Driver ${id}`,
    latitude,
    longitude,
    available,
    updatedAt: timestamp,
  };
}

function freshApp(drivers: Driver[] = []) {
  return createApp(new DriverRepository(drivers));
}

async function postJson(
  baseUrl: string,
  path: string,
  body: unknown
) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("new drivers default to unavailable", async () => {
  await withTestServer(freshApp(), async (baseUrl) => {
    const response = await postJson(
      baseUrl,
      "/api/drivers",
      {
        id: "D1",
        name: "Rahul",
        latitude: 26.1445,
        longitude: 91.7362,
      }
    );

    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.driver.available, false);
    assert.ok(body.driver.updatedAt);
  });
});

test("duplicate IDs return HTTP 409", async () => {
  await withTestServer(
    freshApp([driver("D1", 26.14, 91.73)]),
    async (baseUrl) => {
      const response = await postJson(
        baseUrl,
        "/api/drivers",
        {
          id: "D1",
          name: "Duplicate",
          latitude: 26.15,
          longitude: 91.75,
        }
      );

      const body = await response.json();

      assert.equal(response.status, 409);
      assert.equal(
        body.error.code,
        "DRIVER_ALREADY_EXISTS"
      );
    }
  );
});

test("invalid coordinates return HTTP 400", async () => {
  await withTestServer(freshApp(), async (baseUrl) => {
    const response = await postJson(
      baseUrl,
      "/api/drivers",
      {
        id: "D1",
        name: "Invalid",
        latitude: 91,
        longitude: 91.75,
      }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });
});

test("PATCH updates location and availability", async () => {
  await withTestServer(
    freshApp([driver("D1", 26.14, 91.73, false)]),
    async (baseUrl) => {
      const response = await fetch(
        `${baseUrl}/api/drivers/D1`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: 26.15,
            available: true,
          }),
        }
      );

      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.driver.latitude, 26.15);
      assert.equal(body.driver.longitude, 91.73);
      assert.equal(body.driver.available, true);
    }
  );
});

test("nearest search ignores unavailable drivers", async () => {
  const drivers = [
    driver("D1", 26.1445, 91.7362, false),
    driver("D2", 26.15, 91.74, true),
  ];

  await withTestServer(
    freshApp(drivers),
    async (baseUrl) => {
      const response = await fetch(
        `${baseUrl}/api/drivers/nearest` +
        "?lat=26.1445&lng=91.7362"
      );

      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.driver.id, "D2");
    }
  );
});

test("nearest returns null when no driver qualifies", async () => {
  await withTestServer(
    freshApp([driver("D1", 26.14, 91.73, false)]),
    async (baseUrl) => {
      const response = await fetch(
        `${baseUrl}/api/drivers/nearest` +
        "?lat=26.1445&lng=91.7362"
      );

      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.driver, null);
    }
  );
});

test("sort and heap return identical ordered results", async () => {
  const drivers = [
    driver("D3", 26.16, 91.75),
    driver("D2", 26.15, 91.74),
    driver("D1", 26.1445, 91.7362),
    driver("D4", 26.1445, 91.7362),
  ];

  await withTestServer(
    freshApp(drivers),
    async (baseUrl) => {
      const base =
        `${baseUrl}/api/drivers/nearby` +
        "?lat=26.1445&lng=91.7362&limit=3";

      const sortResponse = await fetch(
        `${base}&strategy=sort`
      );

      const heapResponse = await fetch(
        `${base}&strategy=heap`
      );

      const sorted = await sortResponse.json();
      const heaped = await heapResponse.json();

      assert.equal(sortResponse.status, 200);
      assert.equal(heapResponse.status, 200);

      assert.deepEqual(heaped.drivers, sorted.drivers);

      assert.deepEqual(
        sorted.drivers.map(
          (item: { id: string }) => item.id
        ),
        ["D1", "D4", "D2"]
      );
    }
  );
});

test("blocked and contacted IDs are excluded", async () => {
  const drivers = [
    driver("D1", 26.1445, 91.7362),
    driver("D2", 26.15, 91.74),
    driver("D3", 26.16, 91.75),
  ];

  await withTestServer(
    freshApp(drivers),
    async (baseUrl) => {
      const response = await fetch(
        `${baseUrl}/api/drivers/nearby` +
        "?lat=26.1445&lng=91.7362" +
        "&blockedIds=D1&contactedIds=D2"
      );

      const body = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(
        body.drivers.map(
          (item: { id: string }) => item.id
        ),
        ["D3"]
      );
    }
  );
});

test("invalid limit and strategy return HTTP 400", async () => {
  await withTestServer(freshApp(), async (baseUrl) => {
    for (const query of [
      "limit=0",
      "limit=101",
      "limit=abc",
      "strategy=unknown",
    ]) {
      const response = await fetch(
        `${baseUrl}/api/drivers/nearby` +
        `?lat=26.1445&lng=91.7362&${query}`
      );

      assert.equal(response.status, 400, query);
    }
  });
});

test("each test app starts with independent state", async () => {
  const first = freshApp();
  const second = freshApp();

  await withTestServer(first, async (baseUrl) => {
    const response = await postJson(
      baseUrl,
      "/api/drivers",
      {
        id: "ISOLATED",
        name: "Only in first app",
        latitude: 26.14,
        longitude: 91.73,
      }
    );

    assert.equal(response.status, 201);
  });

  await withTestServer(second, async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/ISOLATED`
    );

    assert.equal(response.status, 404);
  });
});
