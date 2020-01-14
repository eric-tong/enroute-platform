// @flow

import { getAllVehicleStatuses, vehicleStatusCache } from "./vehicleStatus";

import type { BusStop } from "../resolvers/busStops";
import { DateTime } from "luxon";
import type { Status } from "./vehicleStatus";
import { downloadDirections } from "../resolvers/routes";
import { getUpcomingBusStopsOfTrip } from "../resolvers/busStops";

export type BusStopsArrival = {
  busStopId: number,
  busStopName: string,
  arrivalTime: string
};

export async function updateBusArrivalPredictions() {
  for (const status of getAllVehicleStatuses()) {
    if (status.isInTerminal) continue;

    const predictedArrivals = await getBusArrivalPredictions(
      status.tripId,
      status.busStopsVisited,
      {
        longitude: status.avl.longitude,
        latitude: status.avl.latitude,
        roadAngle: status.avl.angle,
        name: `Vehicle ${status.avl.vehicleId}`,
        street: "",
        icon: "",
        id: 0
      }
    );
    vehicleStatusCache.set(status.tripId, { ...status, predictedArrivals });
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
