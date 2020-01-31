// @flow

import { DateTime } from "luxon";
import database from "../database/database";
import { getAllPredictedBusArrivals } from "../vehicleStatus/VehicleStatusGetter";

const DEPARTURE_BUFFER = 60 * 1000;

export async function getDeparturesFromBusStop(
  busStop: BusStop,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength: number }
) {
  const predictedDepartures = getAllPredictedBusArrivals();
  const scheduledDepartures = await getScheduledDeparturesFromBusStop(busStop);

  return getRelevantDepartures(
    predictedDepartures,
    scheduledDepartures,
    maxLength
  );
}

function getScheduledDeparturesFromBusStop(busStop: BusStop) {
  const GET_SCHEDULED_DEPARTURES_FROM_BUS_STOP_ID = `
  SELECT id, minute_of_day as "minuteOfDay", trip_id as "tripId", bus_stop_id as "busStopId" FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY trip_id, minute_of_day DESC) as stops_from_terminal
      FROM scheduled_departures
  ) as scheduled_departures
    WHERE bus_stop_id = $1
    AND stops_from_terminal > 1
    ORDER BY "minuteOfDay"
  `;

  return database
    .query<ScheduledDeparture>(GET_SCHEDULED_DEPARTURES_FROM_BUS_STOP_ID, [
      busStop.id
    ])
    .then(results =>
      results.rows.map<BusArrival>(
        ({ minuteOfDay, tripId, busStopId, id }) => ({
          dateTime: toActualTime(minuteOfDay),
          tripId,
          busStopId: busStop.id,
          busStopName: busStop.name,
          scheduledDepartureId: id
        })
      )
    );
}

export async function getDeparturesFromTripId(
  tripId: number,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength: number }
) {
  const predictedDepartures = getAllPredictedBusArrivals();
  const scheduledDepartures = await getScheduledDeparturesFromTripId(tripId);

  return getRelevantDepartures(
    predictedDepartures,
    scheduledDepartures,
    maxLength,
    false
  );
}

export function getScheduledDeparturesFromTripId(tripId: number) {
  const GET_SCHEDULED_DEPARTURES_FROM_TRIP_ID = `
  SELECT id, minute_of_day AS "minuteOfDay", bus_stop_id AS "busStopId", trip_id AS "tripId" FROM scheduled_departures 
    WHERE trip_id = $1 
    ORDER BY "minuteOfDay"
  `;

  return database
    .query<ScheduledDeparture>(GET_SCHEDULED_DEPARTURES_FROM_TRIP_ID, [tripId])
    .then(results =>
      results.rows.map<BusArrival>(
        ({ minuteOfDay, tripId, busStopId, id }) => ({
          dateTime: toActualTime(minuteOfDay),
          tripId,
          busStopId: busStopId,
          // TODO add name or remove entirely from type
          busStopName: "",
          scheduledDepartureId: id
        })
      )
    );
}

function getRelevantDepartures(
  predictedDepartures: BusArrival[],
  scheduledDepartures: BusArrival[],
  maxLength: number,
  upcomingOnly: boolean = true
) {
  const now = DateTime.local();
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
      !upcomingOnly ||
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

function toActualTime(minuteOfDay: number) {
  return DateTime.local()
    .startOf("day")
    .plus({ minute: minuteOfDay });
}
