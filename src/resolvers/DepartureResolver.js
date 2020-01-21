// @flow

import type { Departure, ScheduledDeparture } from "../graphql/DepartureSchema";

import type { BusArrival } from "../vehicleStatus/vehicleStatusUpdater";
import type { BusStop } from "../graphql/BusStopSchema";
import { DateTime } from "luxon";
import database from "../database/database";
import { getAllPredictedBusArrivals } from "../vehicleStatus/VehicleStatusGetter";

const DEPARTURE_BUFFER = 60 * 1000;

export async function getDeparturesFromBusStop(
  busStop: BusStop,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength: number }
) {
  const now = DateTime.local();
  const predictedDepartures = getAllPredictedBusArrivals();
  const scheduledDepartures = await getScheduledDeparturesFromBusStop(busStop);

  const relevantDepartures: Departure[] = [];
  for (const scheduledDeparture of scheduledDepartures) {
    if (relevantDepartures.length >= maxLength) break;

    const predictedArrival = predictedDepartures.find(
      predictedDeparture =>
        predictedDeparture.tripId === scheduledDeparture.tripId &&
        predictedDeparture.busStopId === scheduledDeparture.busStopId
    );
    if (
      predictedArrival ||
      scheduledDeparture.dateTime.valueOf() + DEPARTURE_BUFFER >= now.valueOf()
    ) {
      relevantDepartures.push({
        scheduled: scheduledDeparture.dateTime.toSQL(),
        predicted: (predictedArrival
          ? predictedArrival
          : scheduledDeparture
        ).dateTime.toSQL(),
        tripId: scheduledDeparture.tripId,
        busStopId: scheduledDeparture.busStopId
      });
    }
  }

  return relevantDepartures;
}

function getScheduledDeparturesFromBusStop(busStop: BusStop) {
  const GET_SCHEDULED_DEPARTURES_FROM_BUS_STOP_ID = `
  SELECT time, trip_id as "tripId", bus_stop_id as "busStopId" FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY trip_id, time DESC) as stops_from_terminal
      FROM departures
  ) as departures
    WHERE bus_stop_id = $1
    AND stops_from_terminal > 1
    ORDER BY time
  `;

  return database
    .query<ScheduledDeparture>(GET_SCHEDULED_DEPARTURES_FROM_BUS_STOP_ID, [
      busStop.id
    ])
    .then(results =>
      results.rows.map<BusArrival>(({ time, tripId, busStopId }) => ({
        dateTime: toActualTime(time),
        tripId,
        busStopId: busStop.id,
        busStopName: busStop.name
      }))
    );
}

export function getScheduledDeparturesFromTripId(tripId: number) {
  const GET_SCHEDULED_DEPARTURES_FROM_TRIP_ID = `
  SELECT time, bus_stop_id AS "busStopId", trip_id AS "tripId" FROM departures 
    WHERE trip_id = $1 
    ORDER BY time
  `;

  return database
    .query<ScheduledDeparture>(GET_SCHEDULED_DEPARTURES_FROM_TRIP_ID, [tripId])
    .then(results => results.rows)
    .then(departures =>
      departures.map<{ time: DateTime, busStopId: number }>(departure => ({
        time: toActualTime(departure.time),
        busStopId: departure.busStopId
      }))
    );
}

function toActualTime(minuteOfDay: number) {
  return DateTime.local()
    .startOf("day")
    .plus({ minute: minuteOfDay });
}
