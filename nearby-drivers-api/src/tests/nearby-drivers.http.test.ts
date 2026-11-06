
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

test("GET /nearby returns the same drivers for both strategies", async () => {
  await withServer(async (baseUrl) => {
    const base =
      `${baseUrl}/api/drivers/nearby` +
      "?lat=26.1445&lng=91.7362&limit=3";

    const [sortResponse, heapResponse] =
      await Promise.all([
        fetch(`${base}&strategy=sort`),
        fetch(`${base}&strategy=heap`),
      ]);

    const sorted = await sortResponse.json();
    const heaped = await heapResponse.json();

    assert.equal(sortResponse.status, 200);
    assert.equal(heapResponse.status, 200);
    assert.deepEqual(heaped.drivers, sorted.drivers);
    assert.equal(heaped.count, sorted.count);
  });
});

test("Blocked IDs are excluded", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/nearby` +
      "?lat=26.1445&lng=91.7362&blockedIds=D1"
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(
      body.drivers.every(
        (driver: { id: string }) => driver.id !== "D1"
      )
    );
  });
});

test("Invalid limit returns HTTP 400", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/nearby` +
      "?lat=26.1445&lng=91.7362&limit=-1"
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });
});

test("Invalid strategy returns HTTP 400", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/drivers/nearby` +
      "?lat=26.1445&lng=91.7362&strategy=random"
    );

    assert.equal(response.status, 400);
  });
});
