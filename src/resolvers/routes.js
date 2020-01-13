// @flow

import type { BusStop } from "../resolvers/busStops";
import NodeCache from "node-cache";
import fetch from "node-fetch";
import { getBusStopsInOrder } from "./busStops";
import { getTripIdWithNearestStartTime } from "./trips";
import util from "util";

export const routeByTripCache = new NodeCache({ stdTTL: 6000 });

export async function getRouteCoords(tripId?: number) {
  const trip = tripId ?? (await getTripIdWithNearestStartTime());
  if (routeByTripCache.has(trip)) {
    return routeByTripCache.get(trip);
  } else {
    // $FlowFixMe
    const busStops = await getBusStopsInOrder(trip);
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

export async function downloadDirections(
  coordsList: { longitude: number, latitude: number }[]
) {
  const url = await getURL(coordsList);
  const params: { [string]: string } = {
    geometries: "geojson",
    overview: "full",
    access_token: process.env.MAPBOX_ACCESS_TOKEN ?? ""
  };
  Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));

  return fetch(url)
    .then(response => response.json())
    .then(result => result.routes[0])
    .catch(console.log);
}

async function getURL(busStops: { longitude: number, latitude: number }[]) {
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
