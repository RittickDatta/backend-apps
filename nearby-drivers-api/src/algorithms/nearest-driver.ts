
import type { Driver } from "../models/driver.model";
import {
  haversineDistanceKm,
  type Coordinates,
} from "../utils/distance";

export interface NearestDriverResult {
  driver: Driver;
  distanceKm: number;
}

export interface NearestDriverOptions {
  radiusKm?: number;
}

export function findNearestDriver(
  drivers: readonly Driver[],
  pickup: Coordinates,
  options: NearestDriverOptions = {}
): NearestDriverResult | null {
  let nearest: NearestDriverResult | null = null;

  for (const driver of drivers) {
    // Ignore offline or busy drivers.
    if (!driver.available) {
      continue;
    }

    const distanceKm = haversineDistanceKm(
      pickup,
      driver
    );

    // Optional radius filtering.
    if (
      options.radiusKm !== undefined &&
      distanceKm > options.radiusKm
    ) {
      continue;
    }

    const isCloser =
      nearest === null ||
      distanceKm < nearest.distanceKm;

    const isTieWithSmallerId =
      nearest !== null &&
      distanceKm === nearest.distanceKm &&
      driver.id < nearest.driver.id;

    if (isCloser || isTieWithSmallerId) {
      nearest = {
        driver,
        distanceKm,
      };
    }
  }

  return nearest;
}
