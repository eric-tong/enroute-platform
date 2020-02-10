// @flow

import {
  getAvlOfLastTerminalExitFromVehicleId,
  getLatestAvlTodayFromTripId
} from "./AvlResolver";

import { DateTime } from "luxon";
import database from "../database/database";
import { getBusStopFromAvlId } from "./BusStopResolver";
import { timeDifferenceInSeconds } from "../utils/TimeUtils";

export function getTripIdFromAvlId(avlId: number) {
  const GET_TRIP_ID_FROM_AVL =
    "SELECT trip_id AS id FROM avl_trip WHERE avl_id = $1 LIMIT 1";
  return database
    .query<{ id: number }>(GET_TRIP_ID_FROM_AVL, [avlId])
    .then(results => (results.rows.length ? results.rows[0].id : null));
}

export async function insertTripIdFromAvl(avl: AVL) {
  const tripId = await getAvlOfLastTerminalExitFromVehicleId(
    avl.vehicleId,
    avl.timestamp
  ).then(lastTerminalExit =>
    getTripIdWithNearestStartTime(lastTerminalExit.timestamp)
  );

  const INSERT_INTO_AVL_TRIP = `INSERT INTO avl_trip (avl_id, trip_id) VALUES ($1, $2) RETURNING trip_id AS "tripId"`;
  if (tripId)
    return database
      .query<{ tripId: number }>(INSERT_INTO_AVL_TRIP, [avl.id, tripId])
      .then(results => results.rows[0].tripId);
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
    AND ABS(EXTRACT(minute FROM $1::TIMESTAMP) + EXTRACT(hour FROM $1::TIMESTAMP) * 60 - first_stops.minute_of_day) < 30
    ORDER BY ABS(EXTRACT(minute FROM $1::TIMESTAMP) + EXTRACT(hour FROM $1::TIMESTAMP) * 60 - first_stops.minute_of_day)
    LIMIT 1
  `;

  return database
    .query<{ tripId: number }>(GET_TRIP_ID_WITH_NEAREST_START_TIME, [timestamp])
    .then(results =>
      results.rows.length > 0 ? results.rows[0].tripId : undefined
    );
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

export async function tripIsStarted(tripId: number) {
  const latestAvlToday = await getLatestAvlTodayFromTripId(tripId);
  if (latestAvlToday) {
    const timeSinceLatestAvlToday = timeDifferenceInSeconds(
      DateTime.fromSQL(latestAvlToday.timestamp)
    );
    if (Math.abs(timeSinceLatestAvlToday) < 60) {
      return true;
    }
  }
  return false;
}
