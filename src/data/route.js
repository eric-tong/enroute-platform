// @flow

import fetch from "node-fetch";
import { getBusStops } from "./busStops";

const params: { [string]: string } = {
  geometries: "geojson",
  overview: "full",
  access_token: process.env.MAPBOX_ACCESS_TOKEN ?? "",
};
const coords = getBusStops().reduce(
  (total, current) =>
    total +
    (total.length > 0 ? ";" : "") +
    current.coords.y +
    "," +
    current.coords.x,
  ""
);
const url = new URL(
  `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`
);

Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));

export function getRouteCoords() {
  return fetch(url)
    .then(response => response.json())
    .then(result =>
      result.routes[0].geometry.coordinates.map(([lon, lat]) => ({
        x: lat,
        y: lon,
      }))
    )
    .catch(console.log);
}
