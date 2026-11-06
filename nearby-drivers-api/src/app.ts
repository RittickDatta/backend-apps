import express from "express";
import { healthRouter } from "./routes/health.routes";
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";

export const app = express();

app.use(express.json({ limit: "100kb" }));

app.use("/health", healthRouter);

app.use(notFound);

app.use(errorHandler);