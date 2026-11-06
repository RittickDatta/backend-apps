
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
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

test("GET /api/drivers/nearest returns D1", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/nearest?lat=26.1445&lng=91.7362`
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.driver.id, "D1");
    assert.equal(body.distanceKm, 0);
  });
});

test("Returns null when no driver is in range", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/nearest?lat=0&lng=0&radiusKm=1`
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.driver, null);
  });
});

test("Invalid latitude returns 400", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/nearest?lat=200&lng=91.7362`
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });
});

test("Missing longitude returns 400", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/nearest?lat=26.1445`
    );

    assert.equal(response.status, 400);
  });
});
