
import { test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { app } from "../app";

async function withServer(
  run: (baseUrl: string) => Promise<void>
) {
  const server = app.listen(0);

  try {
    await new Promise<void>((resolve) => {
      server.once("listening", resolve);
    });

    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}`;

    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

test("GET /api/drivers lists seeded drivers", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/drivers`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.count >= 3);
    assert.ok(Array.isArray(body.drivers));
  });
});

test("POST /api/drivers creates a driver", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/drivers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "TEST_CREATE_1",
        name: "Test Driver",
        latitude: 26.15,
        longitude: 91.75,
        available: true,
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.driver.id, "TEST_CREATE_1");
    assert.equal(body.driver.available, true);
  });
});

test("Duplicate driver ID returns 409", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/drivers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "D1",
        name: "Duplicate",
        latitude: 26.15,
        longitude: 91.75,
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 409);
    assert.equal(body.error.code, "DRIVER_ALREADY_EXISTS");
  });
});

test("PATCH updates driver availability", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/TEST_CREATE_1`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: false }),
      }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.driver.available, false);
  });
});

test("Invalid coordinates return 400", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/drivers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "INVALID_1",
        name: "Invalid Driver",
        latitude: 200,
        longitude: 91.75,
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });
});

test("Unknown driver returns 404", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/DOES_NOT_EXIST`
    );

    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error.code, "DRIVER_NOT_FOUND");
  });
});
