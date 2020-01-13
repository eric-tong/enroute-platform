// @flow

import database from "../database/database";

const GET_CURRENT_TRIP_ID = `
WITH first_stops AS (
  SELECT trip_id, time, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY time) AS stop_number FROM departures
)

SELECT trip_id as "tripId" FROM first_stops  
  WHERE stop_number = 1
  ORDER BY ABS(EXTRACT(minute FROM NOW()) + EXTRACT(hour FROM NOW()) * 60 - first_stops.time)
  LIMIT 1
`;

export function getCurrentTripId() {
  return database
    .query<{ tripId: number }>(GET_CURRENT_TRIP_ID)
    .then(results => results.rows[0].tripId);
}
