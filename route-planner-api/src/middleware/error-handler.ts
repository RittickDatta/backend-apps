
import type {
  ErrorRequestHandler,
  RequestHandler,
} from "express";

import { GraphError } from "../graph/graph.repository";

export const notFoundHandler: RequestHandler = (
  req,
  res
) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req,
  res,
  _next
) => {
  if (err instanceof GraphError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Malformed JSON from express.json()
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === 400
  ) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON",
      },
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
