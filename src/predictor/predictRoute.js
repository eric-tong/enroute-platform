// @flow

import NodeCache from "node-cache";
import fetch from "node-fetch";
import { getBusStopsInOrder } from "../resolvers/busStops";
import { getCurrentTripId } from "../resolvers/trips";

export const routeByTripCache = new NodeCache({ stdTTL: 6000 });

export async function getRouteCoords(tripId?: number) {
  const trip = tripId ?? (await getCurrentTripId());
  if (routeByTripCache.has(trip)) {
    return routeByTripCache.get(trip);
  } else {
    const routeCoords = downloadRouteCoords(trip);
    routeByTripCache.set(trip, routeCoords);
    return routeCoords;
  }
}

async function downloadRouteCoords(tripId: number) {
  const url = await getURL(tripId);
  const params: { [string]: string } = {
    geometries: "geojson",
    overview: "full",
    access_token: process.env.MAPBOX_ACCESS_TOKEN ?? ""
  };
  Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));

  return fetch(url)
    .then(response => response.json())
    .then(result =>
      result.routes[0].geometry.coordinates.map(([longitude, latitude]) => ({
        latitude,
        longitude
      }))
    )
    .catch(console.log);
}

async function getURL(tripId: number) {
  const busStops = await getBusStopsInOrder(tripId);
  const coords = busStops.reduce(
    (total, current) =>
      total +
      (total.length > 0 ? ";" : "") +
      current.longitude +
      "," +
      current.latitude,
    ""
  );
  return new URL(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`
  );
}
