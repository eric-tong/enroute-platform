// @flow

import type { BusStop } from "./busStops";
import { DateTime } from "luxon";
import database from "../database/database";
import { getAllVehicleStatuses } from "../predictor/vehicleStatus";

const DEPARTURE_BUFFER = 60 * 1000;
const GET_DEPARTURE_TIMES_WITH_BUS_STOP_ID = `
SELECT time, trip_id as "tripId" FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY trip_id, time DESC) as stops_from_terminal
    FROM departures
) as departures
  WHERE bus_stop_id = $1
  AND stops_from_terminal > 1
  ORDER BY time
`;
const GET_DEPARTURES_IN_TRIP = `SELECT time, bus_stop_id AS "busStopId" FROM departures WHERE trip_id = $1 ORDER BY time`;

export async function getDeparturesFromBusStop(
  busStop: BusStop,
  { maxLength = 5 }: { maxLength: number }
) {
  const now = DateTime.local();
  const statuses = getAllVehicleStatuses();
  const tripIdToArrivals = new Map<
    number,
    { dateTime: DateTime, confidence: number }
  >();
  statuses.forEach(toMap);

  const scheduledDepartures = await database
    .query<{ time: number, tripId: number }>(
      GET_DEPARTURE_TIMES_WITH_BUS_STOP_ID,
      [busStop.id]
    )
    .then(results =>
      results.rows.map<{ dateTime: DateTime, tripId: number }>(
        ({ time, tripId }) => ({
          dateTime: toActualTime(time),
          tripId: tripId
        })
      )
    );

  const relevantDepartures: { scheduled: string, predicted: ?string }[] = [];
  for (const departure of scheduledDepartures) {
    if (relevantDepartures.length >= maxLength) break;

    const predictedArrival = tripIdToArrivals.get(departure.tripId);
    if (
      predictedArrival ||
      departure.dateTime.valueOf() + DEPARTURE_BUFFER >= now.valueOf()
    ) {
      relevantDepartures.push({
        scheduled: departure.dateTime.toSQL(),
        predicted: predictedArrival && predictedArrival.dateTime.toSQL()
      });
    }
  }

  return relevantDepartures;

  function toMap(status) {
    if (status.isInTerminal) {
      return;
    } else if (status.currentBusStopId === busStop.id) {
      tripIdToArrivals.set(status.tripId, { dateTime: now, confidence: 1 });
    } else if (
      !tripIdToArrivals.has(status.tripId) ||
      // $FlowFixMe status definitely exists here
      status.tripIdConfidence > tripIdToArrivals.get(status.tripId).confidence
    ) {
      const arrivalAtBusStop = status.predictedArrivals
        .slice(0, -1)
        .find(predictedArrival => predictedArrival.busStopId === busStop.id);
      if (arrivalAtBusStop) {
        tripIdToArrivals.set(status.tripId, {
          dateTime: DateTime.fromSQL(arrivalAtBusStop.arrivalTime),
          confidence: status.tripIdConfidence
        });
      }
    }
  }
}

export function getDeparturesInTrip(tripId: number) {
  return database
    .query<{ time: number, busStopId: number }>(GET_DEPARTURES_IN_TRIP, [
      tripId
    ])
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
