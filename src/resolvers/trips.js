// @flow

import { DateTime } from "luxon";
import database from "../database/database";

const GET_TRIP_ID_WITH_NEAREST_START_TIME = `
WITH first_stops AS (
  SELECT trip_id, time, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY time) AS stop_number FROM departures
)

SELECT trip_id as "tripId" FROM first_stops  
  WHERE stop_number = 1
  ORDER BY ABS(EXTRACT(minute FROM NOW()) + EXTRACT(hour FROM NOW()) * 60 - first_stops.time)
  LIMIT 1
`;
const GET_CURRENT_TRIP_OF_VEHICLE = `
WITH last_terminal_exit AS (
  SELECT EXTRACT(minute FROM avl.timestamp) + EXTRACT(hour FROM avl.timestamp) * 60 AS minute_of_day FROM avl
      INNER JOIN bus_stop_visits ON bus_stop_visits.avl_id = avl.id
      INNER JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
      WHERE vehicle_id = $1
      AND avl.timestamp <= $2
      AND bus_stops.is_terminal
      ORDER BY timestamp DESC
      LIMIT 1
),
first_stops AS (
  SELECT trip_id, time, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY time) AS stop_number FROM departures
)

SELECT trip_id as "tripId", ABS(last_terminal_exit.minute_of_day - first_stops.time) AS delta FROM first_stops 
  CROSS JOIN last_terminal_exit 
  WHERE stop_number = 1
  ORDER BY delta
  LIMIT 2
`;

export function getTripIdWithNearestStartTime() {
  return database
    .query<{ tripId: number }>(GET_TRIP_ID_WITH_NEAREST_START_TIME)
    .then(results => results.rows[0].tripId);
}

export function getCurrentTripIdOfVehicle(
  vehicleId: number,
  beforeTimestamp: string = DateTime.local().toSQL()
) {
  return database
    .query<{ tripId: number, delta: number }>(GET_CURRENT_TRIP_OF_VEHICLE, [
      vehicleId,
      beforeTimestamp
    ])
    .then(results => results.rows)
    .then(trips => {
      const tripId = trips.length > 0 ? trips[0].tripId : 0;
      const confidence =
        trips.length > 1 ? 1 - trips[0].delta / trips[1].delta / 2 : 1;
      return { tripId, confidence };
    });
}
