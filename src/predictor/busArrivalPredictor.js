// @flow

import { DateTime } from "luxon";
import type { Status } from "./vehicleStatus";
import { downloadDirections } from "../resolvers/routes";
import { getUpcomingBusStopsOfTrip } from "../resolvers/busStops";

export type BusStopsArrival = {
  busStopId: number,
  busStopName: string,
  arrivalTime: string
};

export async function getBusArrivalPredictions(
  tripId: number,
  busStopsVisited: number[],
  vehicleCoords: { longitude: number, latitude: number }
) {
  const upcomingBusStops = await getUpcomingBusStopsOfTrip(
    tripId,
    busStopsVisited
  );
  const directions = await downloadDirections([
    vehicleCoords,
    ...upcomingBusStops
  ]);
  const durations: number[] = directions.legs.map(leg => leg.duration);
  const now = DateTime.local();

  return upcomingBusStops.map<BusStopsArrival>((busStop, i) => ({
    busStopId: busStop.id,
    busStopName: busStop.name,
    arrivalTime: now.plus({ seconds: durations[i - 1] }).toSQL()
  }));
}
