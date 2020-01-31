// @flow

import fetch from "node-fetch";

export async function downloadDirections(busStops: BusStop[]) {
  const url = await getURL(busStops);
  const params: { [string]: string } = {
    geometries: "geojson",
    overview: "full",
    approaches: "curb;".repeat(busStops.length).slice(0, -1),
    bearings: busStops
      .map(busStop => (busStop.roadAngle ? `${busStop.roadAngle},45` : ""))
      .join(";"),
    access_token: process.env.MAPBOX_ACCESS_TOKEN ?? ""
  };
  Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));
  return fetch(url)
    .then(response => response.json())
    .then(result => {
      if (result.code !== "Ok") throw result;
      return result.routes[0];
    })
    .catch(console.error);
}

async function getURL(busStops: BusStop[]) {
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
