
export interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(
  from: Coordinates,
  to: Coordinates
): number {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const deltaLat = toRadians(
    to.latitude - from.latitude
  );

  const deltaLng = toRadians(
    to.longitude - from.longitude
  );

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) ** 2;

  // Protect against floating-point rounding.
  const safeA = Math.min(1, Math.max(0, a));

  return (
    2 *
    EARTH_RADIUS_KM *
    Math.asin(Math.sqrt(safeA))
  );
}
