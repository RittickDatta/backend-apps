
import {
  findTopKDrivers,
  type RankedDriver,
  type TopKOptions,
} from "../algorithms/top-k-drivers";
import { driverRepository } from "../repositories/driver.repository";
import { parseNearestDriverQuery } from "./nearest-driver.service";
import { ApiError } from "../utils/api-error";

export interface NearbyDriversQuery {
  lat: number;
  lng: number;
  limit: number;
  strategy: "sort" | "heap";
  radiusKm?: number;
  blockedIds: string[];
  contactedIds: string[];
}

function parseLimit(value: unknown): number {
  if (value === undefined) return 5;

  if (
    typeof value !== "string" ||
    !/^[1-9]\d*$/.test(value)
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "limit must be a positive integer"
    );
  }

  const limit = Number(value);

  if (!Number.isSafeInteger(limit) || limit > 100) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "limit must be between 1 and 100"
    );
  }

  return limit;
}

function parseStrategy(
  value: unknown
): "sort" | "heap" {
  if (value === undefined) return "heap";

  if (value !== "sort" && value !== "heap") {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "strategy must be sort or heap"
    );
  }

  return value;
}

function parseIds(
  value: unknown,
  field: string
): string[] {
  if (value === undefined) return [];

  if (typeof value !== "string") {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `${field} must be comma-separated IDs`
    );
  }

  if (value.trim() === "") return [];

  const ids = value.split(",").map((id) => id.trim());

  if (
    ids.length > 1000 ||
    ids.some(
      (id) => !/^[A-Za-z0-9_-]{1,32}$/.test(id)
    )
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `${field} contains invalid driver IDs`
    );
  }

  return [...new Set(ids)];
}

export function parseNearbyDriversQuery(
  query: Record<string, unknown>
): NearbyDriversQuery {
  const location = parseNearestDriverQuery(query);

  return {
    ...location,
    limit: parseLimit(query.limit),
    strategy: parseStrategy(query.strategy),
    blockedIds: parseIds(query.blockedIds, "blockedIds"),
    contactedIds: parseIds(query.contactedIds, "contactedIds"),
  };
}

export function getNearbyDrivers(
  query: NearbyDriversQuery
): RankedDriver[] {
  const options: TopKOptions = {
    limit: query.limit,
    strategy: query.strategy,
    radiusKm: query.radiusKm,
    blockedIds: query.blockedIds,
    contactedIds: query.contactedIds,
  };

  return findTopKDrivers(
    driverRepository.findAll(),
    {
      latitude: query.lat,
      longitude: query.lng,
    },
    options
  );
}
