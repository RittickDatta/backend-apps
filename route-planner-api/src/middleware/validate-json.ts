import type { RequestHandler } from 'express';

export const requireJsonObject: RequestHandler = (req, res, next) => {
  const contentType = req.headers['content-type'];

  if (typeof contentType !== 'string' || !req.is('application/json')) {
    res.status(415).json({
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Content-Type must be application/json',
      },
    });
    return;
  }

  if (
    req.body === null ||
    typeof req.body !== 'object' ||
    Array.isArray(req.body)
  ) {
    res.status(400).json({
      error: {
        code: 'INVALID_JSON_BODY',
        message: 'Request body must be a JSON object',
      },
    });
    return;
  }

  if (
    req.body === null ||
    typeof req.body !== 'object' ||
    Array.isArray(req.body) ||
    Object.keys(req.body).length === 0
  ) {
    res.status(400).json({
      error: {
        code: 'INVALID_JSON_BODY',
        message: 'Request body must be a non-empty JSON object',
      },
    });
    return;
  }

  next();
};
