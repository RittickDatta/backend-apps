
import type {
  CreateDriverInput,
  Driver,
  UpdateDriverInput,
} from "../models/driver.model";
import {
  DriverRepository,
  driverRepository,
} from "../repositories/driver.repository";
import { ApiError } from "../utils/api-error";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requireObject(value: unknown): JsonObject {
  if (!isObject(value)) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Request body must be a JSON object"
    );
  }

  return value;
}

function rejectUnknownFields(
  body: JsonObject,
  allowed: readonly string[]
): void {
  const unknown = Object.keys(body).filter(
    (key) => !allowed.includes(key)
  );

  if (unknown.length > 0) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `Unknown fields: ${unknown.join(", ")}`
    );
  }
}

function validateId(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[A-Za-z0-9_-]{1,32}$/.test(value)
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "id must contain 1–32 letters, numbers, underscores or hyphens"
    );
  }

  return value;
}

function validateName(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.trim().length > 100
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "name must contain 1–100 characters"
    );
  }

  return value.trim();
}

function validateCoordinate(
  value: unknown,
  field: "latitude" | "longitude"
): number {
  const min = field === "latitude" ? -90 : -180;
  const max = field === "latitude" ? 90 : 180;

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `${field} must be a number between ${min} and ${max}`
    );
  }

  return value;
}

function validateAvailable(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "available must be a boolean"
    );
  }

  return value;
}

function parseCreateInput(value: unknown): CreateDriverInput {
  const body = requireObject(value);

  rejectUnknownFields(body, [
    "id",
    "name",
    "latitude",
    "longitude",
    "available",
  ]);

  return {
    id: validateId(body.id),
    name: validateName(body.name),
    latitude: validateCoordinate(body.latitude, "latitude"),
    longitude: validateCoordinate(body.longitude, "longitude"),
    available:
      body.available === undefined
        ? false
        : validateAvailable(body.available),
  };
}

function parseUpdateInput(value: unknown): UpdateDriverInput {
  const body = requireObject(value);

  rejectUnknownFields(body, [
    "latitude",
    "longitude",
    "available",
  ]);

  if (Object.keys(body).length === 0) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Provide at least one field to update"
    );
  }

  const changes: UpdateDriverInput = {};

  if ("latitude" in body) {
    changes.latitude = validateCoordinate(
      body.latitude,
      "latitude"
    );
  }

  if ("longitude" in body) {
    changes.longitude = validateCoordinate(
      body.longitude,
      "longitude"
    );
  }

  if ("available" in body) {
    changes.available = validateAvailable(body.available);
  }

  return changes;
}

export class DriverService {
  constructor(
    private readonly repository: DriverRepository
  ) {}

  listDrivers(): Driver[] {
    return this.repository.findAll();
  }

  getDriver(id: string): Driver {
    const driver = this.repository.findById(id);

    if (!driver) {
      throw new ApiError(
        404,
        "DRIVER_NOT_FOUND",
        `Driver ${id} was not found`
      );
    }

    return driver;
  }

  createDriver(body: unknown): Driver {
    const input = parseCreateInput(body);

    if (this.repository.exists(input.id)) {
      throw new ApiError(
        409,
        "DRIVER_ALREADY_EXISTS",
        `Driver ${input.id} already exists`
      );
    }

    const driver: Driver = {
      ...input,
      available: input.available ?? false,
      updatedAt: new Date().toISOString(),
    };

    return this.repository.create(driver);
  }

  updateDriver(id: string, body: unknown): Driver {
    const changes = parseUpdateInput(body);

    this.getDriver(id);

    const updated = this.repository.update(id, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });

    // Defensive check in case the repository changes.
    if (!updated) {
      throw new ApiError(
        404,
        "DRIVER_NOT_FOUND",
        `Driver ${id} was not found`
      );
    }

    return updated;
  }
}

export const driverService = new DriverService(
  driverRepository
);
