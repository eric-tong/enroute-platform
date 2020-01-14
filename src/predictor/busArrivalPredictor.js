// @flow

import type { BusStop } from "../resolvers/busStops";
import { DateTime } from "luxon";
import type { Status } from "./vehicleStatus";
import { downloadDirections } from "../resolvers/routes";
import { getUpcomingBusStopsOfTrip } from "../resolvers/busStops";
import { vehicleStatusCache } from "./vehicleStatus";

export type BusStopsArrival = {
  busStopId: number,
  busStopName: string,
  arrivalTime: string
};

export async function updateBusArrivalPredictions() {
  for (const key of vehicleStatusCache.keys()) {
    const status: Status = vehicleStatusCache.get(key);
    if (status.isInTerminal) continue;

    getBusArrivalPredictions(status.tripId, status.busStopsVisited, {
      longitude: status.avl.latitude,
      latitude: status.avl.longitude,
      roadAngle: status.avl.angle,
      name: `Vehicle ${status.avl.vehicleId}`,
      street: "",
      icon: "",
      id: 0
    });
  }
}

async function getBusArrivalPredictions(
  tripId: number,
  busStopsVisited: number[],
  vehicle: BusStop
) {
  const upcomingBusStops = await getUpcomingBusStopsOfTrip(
    tripId,
    busStopsVisited
  );
  const directions = await downloadDirections([vehicle, ...upcomingBusStops]);
  const durations: number[] = directions.legs.map(leg => leg.duration);
  const now = DateTime.local();

  return upcomingBusStops.map<BusStopsArrival>((busStop, i) => ({
    busStopId: busStop.id,
    busStopName: busStop.name,
    arrivalTime: now.plus({ seconds: durations[i - 1] }).toSQL()
  }));
}
