
import {
  findNearestDriver,
  type NearestDriverResult,
} from "../algorithms/nearest-driver";
import { DriverRepository } from "../repositories/driver.repository";
import { ApiError } from "../utils/api-error";

export interface NearestDriverQuery {
  lat: number;
  lng: number;
  radiusKm?: number;
}

function parseNumber(
  value: unknown,
  field: string,
  min: number,
  max: number
): number {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `${field} must be a valid number`
    );
  }

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < min ||
    parsed > max
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `${field} must be between ${min} and ${max}`
    );
  }

  return parsed;
}

export function parseNearestDriverQuery(
  query: Record<string, unknown>
): NearestDriverQuery {
  const lat = parseNumber(query.lat, "lat", -90, 90);
  const lng = parseNumber(query.lng, "lng", -180, 180);

  const radiusKm =
    query.radiusKm === undefined
      ? undefined
      : parseNumber(
          query.radiusKm,
          "radiusKm",
          0,
          20000
        );

  return { lat, lng, radiusKm };
}

export class NearestDriverService {
  constructor(
    private readonly repository: DriverRepository
  ) {}

  findNearest(
    query: NearestDriverQuery
  ): NearestDriverResult | null {
    return findNearestDriver(
      this.repository.findAll(),
      {
        latitude: query.lat,
        longitude: query.lng,
      },
      { radiusKm: query.radiusKm }
    );
  }
}
