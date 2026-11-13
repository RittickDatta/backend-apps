
import type { RequestHandler } from "express";

export const validateId: RequestHandler = (
  req,
  res,
  next
) => {
  const id = req.params.id;

  if (
    typeof id !== "string" ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(id)
  ) {
    res.status(400).json({
      error: {
        code: "INVALID_IDENTIFIER",
        message: "Invalid resource identifier",
      },
    });
    return;
  }

  next();
};
