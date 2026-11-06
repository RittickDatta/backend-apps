
import { test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { app } from "../app";

test("GET /health returns service status", async () => {
  const server = app.listen(0);

  try {
    await new Promise<void>((resolve) => {
      server.once("listening", resolve);
    });

    const address = server.address() as AddressInfo;
    const url = `http://127.0.0.1:${address.port}/health`;

    const response = await fetch(url);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.service, "nearby-drivers-api");
    assert.ok(body.timestamp);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});

test("Unknown routes return 404", async () => {
  const server = app.listen(0);

  try {
    await new Promise<void>((resolve) => {
      server.once("listening", resolve);
    });

    const address = server.address() as AddressInfo;
    const url = `http://127.0.0.1:${address.port}/missing`;

    const response = await fetch(url);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error.code, "NOT_FOUND");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});
