// @flow

import { getAllVehicleStatuses, vehicleStatusCache } from "./vehicleStatus";

import type { BusStop } from "../resolvers/busStops";
import { DateTime } from "luxon";
import type { Status } from "./vehicleStatus";
import { downloadDirections } from "../resolvers/routes";
import { getDeparturesInTrip } from "../resolvers/departures";
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

    if (predictedArrivals)
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
  const [directions, departures] = await Promise.all([
    downloadDirections([vehicle, ...upcomingBusStops]),
    getDeparturesInTrip(tripId)
  ]);

  if (!directions || !directions.legs) {
    console.error("No directions returned from API");
    return;
  }
  const durations: number[] = directions.legs.map(leg => leg.duration);
  const upcomingDepartures = departures.slice(-1 * durations.length);
  let cumulativeTime = timeOfDataCapture;

  return upcomingBusStops.map<BusStopsArrival>((busStop, i) => {
    const predictedTime = cumulativeTime.plus({ seconds: durations[i - 1] });
    cumulativeTime =
      upcomingDepartures[i].time.valueOf() > predictedTime.valueOf()
        ? upcomingDepartures[i].time
        : predictedTime;

    return {
      busStopId: busStop.id,
      busStopName: busStop.name,
      arrivalTime: predictedTime.toSQL()
    };
  });
}
