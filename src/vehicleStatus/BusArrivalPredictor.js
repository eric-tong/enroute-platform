// @flow

import { DateTime } from "luxon";
import database from "../database/database";
import { downloadDirections } from "../resolvers/RouteResolver";
import { getScheduledDeparturesFromTripId } from "../resolvers/DepartureResolver";
import { getUpcomingBusStopsFromTripId } from "../resolvers/BusStopResolver";
import { vehicleStatusCache } from "./VehicleStatusUpdater";

export async function updateBusArrivalPredictions() {
  for (const vehicleId of vehicleStatusCache.keys()) {
    const status: Status = vehicleStatusCache.get(vehicleId);
    if (status.isInTerminal) continue;

    const predictedArrivals = await getBusArrivalPredictions(
      status.tripId,
      status.busStopsVisited,
      {
        longitude: status.avl.longitude,
        latitude: status.avl.latitude,
        roadAngle: status.avl.angle,
        name: `Vehicle ${vehicleId}`,
        url: "",
        direction: "",
        street: "",
        icon: "",
        id: 0,
        isTerminal: false
      },
      DateTime.fromJSDate(status.avl.timestamp)
    );

    if (predictedArrivals) {
      vehicleStatusCache.set(vehicleId, {
        ...status,
        predictedArrivals
      });
      predictedArrivals.forEach(predictedArrival => {
        database.query(
          "INSERT INTO predicted_departures(scheduled_departure_id, avl_id, predicted_timestamp) VALUES($1, $2, $3)",
          [
            predictedArrival.scheduledDepartureId,
            status.avl.id,
            predictedArrival.dateTime.toSQL()
          ]
        );
      });
    }
  }
}

async function getBusArrivalPredictions(
  tripId: number,
  busStopsVisited: number[],
  vehicle: BusStop,
  timeOfDataCapture: DateTime
) {
  const upcomingBusStops = await getUpcomingBusStopsFromTripId(
    tripId,
    busStopsVisited
  );
  const [directions, scheduledDepartures] = await Promise.all([
    downloadDirections([vehicle, ...upcomingBusStops]),
    getScheduledDeparturesFromTripId(tripId)
  ]);

  if (!directions || !directions.legs) {
    console.error("No directions returned from API");
    return;
  }
  const durations: number[] = directions.legs.map(leg => leg.duration);
  const upcomingDepartures = scheduledDepartures.slice(-1 * durations.length);
  let cumulativeTime = timeOfDataCapture;

  return upcomingBusStops.map<BusArrival>((busStop, i) => {
    const predictedTime = cumulativeTime.plus({ seconds: durations[i - 1] });
    cumulativeTime =
      upcomingDepartures[i].dateTime.valueOf() > predictedTime.valueOf()
        ? upcomingDepartures[i].dateTime
        : predictedTime;

    return {
      tripId,
      busStopId: busStop.id,
      busStopName: busStop.name,
      dateTime: predictedTime,
      scheduledDepartureId: upcomingDepartures[i].scheduledDepartureId
    };
  });
}
