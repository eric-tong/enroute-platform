// @flow

import fetch from "node-fetch";
import { getBusStopsInOrder } from "../resolvers/busStops";

export async function getRouteCoords() {
  const url = await getURL();
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

async function getURL() {
  const busStops = await getBusStopsInOrder();
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
