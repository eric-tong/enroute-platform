// @flow

import fetch from "node-fetch";
import { getBusStopsInOrder } from "./busStops";

export function getRouteCoords() {
  const url = getURL();
  const params: { [string]: string } = {
    geometries: "geojson",
    overview: "full",
    access_token: process.env.MAPBOX_ACCESS_TOKEN ?? "",
  };
  Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));

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

function getURL() {
  const coords = getBusStopsInOrder().reduce(
    (total, current) =>
      total +
      (total.length > 0 ? ";" : "") +
      current.coords.y +
      "," +
      current.coords.x,
    ""
  );
  return new URL(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`
  );
}
