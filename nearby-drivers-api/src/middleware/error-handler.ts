
import type { ErrorRequestHandler } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req,
  res,
  _next
) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  if (
    err instanceof SyntaxError &&
    "body" in err
  ) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON",
      },
    });
    return;
  }

  console.error("Unexpected error:", err);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      ...(env.nodeEnv === "development" &&
      err instanceof Error
        ? { details: err.message }
        : {}),
    },
  });
};
