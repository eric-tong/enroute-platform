// @flow

import NodeCache from "node-cache";
import { downloadDirections } from "../utils/MapboxUtils";
import { getBusStopsFromTripId } from "./BusStopResolver";
import { getTripIdWithNearestStartTime } from "./TripResolver";
import util from "util";

export const routeByTripCache = new NodeCache({ stdTTL: 6000 });

export async function getRouteFromTripId(tripId?: number) {
  const trip = tripId ?? (await getTripIdWithNearestStartTime());
  if (routeByTripCache.has(trip)) {
    return routeByTripCache.get(trip);
  } else {
    const busStops = await getBusStopsFromTripId(trip);
    const route = await downloadDirections(busStops);
    const routeCoords = route.geometry.coordinates.map(
      ([longitude, latitude]) => ({
        latitude,
        longitude
      })
    );
    routeByTripCache.set(trip, routeCoords);
    return routeCoords;
  }
}
