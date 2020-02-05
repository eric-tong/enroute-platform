// @flow

import fetch from "node-fetch";

export async function downloadDirections(
  waypoints: {|
    longitude: number,
    latitude: number,
    roadAngle: ?number
  |}[]
) {
  const url = await getURL(waypoints);
  const params: { [string]: string } = {
    geometries: "geojson",
    overview: "full",
    approaches: "curb;".repeat(waypoints.length).slice(0, -1),
    bearings: waypoints
      .map(waypoint => (waypoint.roadAngle ? `${waypoint.roadAngle},45` : ""))
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

async function getURL(
  waypoints: {|
    longitude: number,
    latitude: number,
    roadAngle: ?number
  |}[]
) {
  const coords = waypoints.reduce(
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
