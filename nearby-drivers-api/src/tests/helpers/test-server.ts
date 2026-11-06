
import type { Express } from "express";
import type { AddressInfo } from "node:net";

export async function withTestServer(
  app: Express,
  run: (baseUrl: string) => Promise<void>
): Promise<void> {
  const server = app.listen(0);

  try {
    if (!server.listening) {
      await new Promise<void>((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
      });
    }

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
