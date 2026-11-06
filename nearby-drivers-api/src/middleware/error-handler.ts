import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error("Request error: ", err);

    res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
            ...(env.nodeEnv === "development" && 
                err instanceof Error ? { details: err.message } : {}
            )

        }
    })
}