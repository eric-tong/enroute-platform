// @flow

import { DateTime } from "luxon";
import database from "../database/database";
import { getAvlOfLastTerminalExitFromVehicleId } from "./AvlResolver";
import { getBusStopFromAvlId } from "./BusStopResolver";

export function getTripIdFromAvlId(avlId: number) {
  const GET_TRIP_ID_FROM_AVL =
    "SELECT trip_id AS id FROM avl_trip WHERE avl_id = $1 LIMIT 1";
  return database
    .query<{ id: number }>(GET_TRIP_ID_FROM_AVL, [avlId])
    .then(results => (results.rows.length ? results.rows[0].id : null));
}

export async function insertTripIdFromAvl(avl: AVL) {
  const currentBusStop = await getBusStopFromAvlId(avl.id);
  if (currentBusStop.isTerminal) return;

  const tripId = await getAvlOfLastTerminalExitFromVehicleId(
    avl.vehicleId,
    avl.timestamp
  ).then(lastTerminalExit =>
    getTripIdWithNearestStartTime(lastTerminalExit.timestamp)
  );

  const INSERT_INTO_AVL_TRIP =
    "INSERT INTO avl_trip (avl_id, trip_id) VALUES ($1, $2)";
  return database.query<{}>(INSERT_INTO_AVL_TRIP, [avl.id, tripId]);
}

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

export function getTripIdFromVehicleId(
  vehicleId: number,
  beforeTimestamp?: string = DateTime.local().toSQL()
) {
  return getAvlOfLastTerminalExitFromVehicleId(
    vehicleId,
    beforeTimestamp
  ).then(avl => getTripIdWithNearestStartTime(avl.timestamp));
}
