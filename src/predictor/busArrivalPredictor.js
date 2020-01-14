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
  for (const vehicleId of vehicleStatusCache.keys()) {
    const status = vehicleStatusCache.get(vehicleId);
    if (status.isInTerminal) continue;

    const predictedArrivals = await getBusArrivalPredictions(
      status.tripId,
      status.busStopsVisited,
      {
        longitude: status.avl.longitude,
        latitude: status.avl.latitude,
        roadAngle: status.avl.angle,
        name: `Vehicle ${vehicleId}`,
        street: "",
        icon: "",
        id: 0
      },
      DateTime.fromJSDate(status.avl.timestamp)
    );
    vehicleStatusCache.set(vehicleId, {
      ...status,
      predictedArrivals
    });
  }
}

async function getBusArrivalPredictions(
  tripId: number,
  busStopsVisited: number[],
  vehicle: BusStop,
  timeOfDataCapture: DateTime
) {
  const upcomingBusStops = await getUpcomingBusStopsOfTrip(
    tripId,
    busStopsVisited
  );
  const directions = await downloadDirections([vehicle, ...upcomingBusStops]);
  let cumulativeDuration = 0;
  const durations: number[] = directions.legs.map(
    leg => (cumulativeDuration += leg.duration)
  );
  return upcomingBusStops.map<BusStopsArrival>((busStop, i) => ({
    busStopId: busStop.id,
    busStopName: busStop.name,
    arrivalTime: timeOfDataCapture.plus({ seconds: durations[i - 1] }).toSQL()
  }));
}
