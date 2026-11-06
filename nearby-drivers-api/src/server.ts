import { app } from "./app";
import { env } from "./config/env";

const server = app.listen(env.port, () => {
    console.log(`Nearby Drivers API running at http://localhost:${env.port}`);
})

function shutdown(signal: string) {
    console.log(`${signal} received. Shutting down...`);

    server.close((error?:Error) => {
        if(error) {
            console.error("Shutdown failed with error: ", error);
            process.exitCode = 1
        }
    })
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));