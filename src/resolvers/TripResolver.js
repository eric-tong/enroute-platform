// @flow

import { DateTime } from "luxon";
import database from "../database/database";
import { getAvlOfLastTerminalExitFromVehicleId } from "./AvlResolver";

export function getTripIdWithNearestStartTime(
  timestamp: string = DateTime.local().toSQL()
) {
  const GET_TRIP_ID_WITH_NEAREST_START_TIME = `
  WITH first_stops AS (
    SELECT trip_id, minute_of_day, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY minute_of_day) AS stop_number FROM scheduled_departures
  )
  
  SELECT trip_id as "tripId" FROM first_stops  
    WHERE stop_number = 1
    ORDER BY ABS(EXTRACT(minute FROM $1::TIMESTAMP) + EXTRACT(hour FROM $1::TIMESTAMP) * 60 - first_stops.minute_of_day)
    LIMIT 1
  `;

  return database
    .query<{ tripId: number }>(GET_TRIP_ID_WITH_NEAREST_START_TIME, [timestamp])
    .then(results => results.rows[0].tripId);
}

export function getTripIdFromVehicleId(vehicleId: number) {
  return getAvlOfLastTerminalExitFromVehicleId(vehicleId).then(avl =>
    getTripIdWithNearestStartTime(avl.timestamp)
  );
}
