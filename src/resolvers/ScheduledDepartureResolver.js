// @flow

import database from "../database/database";

export const SCHEDULED_DEPARTURE_COLUMNS = [
  "id",
  `minute_of_day AS "minuteOfDay"`,
  `trip_id AS "tripId"`,
  `bus_stop_id AS "busStopId"`
]
  .map(column => "scheduled_departures." + column)
  .join(", ");

export function getScheduledDepartureFromBusStopIdAndTripId(
  busStopId: number,
  tripId: ?number
) {
  const GET_SCHEDULED_DEPARTURE_FROM_BUS_STOP_ID_AND_TRIP_ID = `
    SELECT ${SCHEDULED_DEPARTURE_COLUMNS} FROM scheduled_departures
      WHERE bus_stop_id = $1 AND trip_id = $2
      LIMIT 1
  `;
  return database
    .query<ScheduledDeparture>(
      GET_SCHEDULED_DEPARTURE_FROM_BUS_STOP_ID_AND_TRIP_ID,
      [busStopId, tripId]
    )
    .then(results => results.rows[0]);
}

export function getScheduledDeparturesExceptLastInTripFromBusStopId(
  busStopId: number
) {
  const GET_SCHEDULED_DEPARTURES_FROM_BUS_STOP_ID = `
  SELECT ${SCHEDULED_DEPARTURE_COLUMNS} FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY trip_id, minute_of_day DESC) as stops_from_terminal
      FROM scheduled_departures
  ) as scheduled_departures
    WHERE bus_stop_id = $1
    AND stops_from_terminal > 1
    ORDER BY "minuteOfDay"
  `;

  return database
    .query<ScheduledDeparture>(GET_SCHEDULED_DEPARTURES_FROM_BUS_STOP_ID, [
      busStopId
    ])
    .then(results => results.rows);
}

export function getScheduledDeparturesFromTripId(tripId: number) {
  const GET_SCHEDULED_DEPARTURES_FROM_TRIP_ID = `
  SELECT id, minute_of_day AS "minuteOfDay", bus_stop_id AS "busStopId", trip_id AS "tripId" FROM scheduled_departures 
    WHERE trip_id = $1 
    ORDER BY "minuteOfDay"
  `;

  return database
    .query<ScheduledDeparture>(GET_SCHEDULED_DEPARTURES_FROM_TRIP_ID, [tripId])
    .then(results => results.rows);
}
