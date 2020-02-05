// @flow

import { downloadDirections } from "../utils/MapboxUtils";

async function getTravelDurations(
  waypoints: {|
    longitude: number,
    latitude: number,
    roadAngle: ?number
  |}[]
) {
  const directions = await downloadDirections(waypoints);

  if (!directions || !directions.legs) {
    console.error("No directions returned from API");
    return;
  } else {
    return directions.legs.map(leg => leg.duration);
  }
}
