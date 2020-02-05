// @flow

import { DateTime } from "luxon";
import database from "../database/database";

export const AVL_COLUMNS = [
  "id",
  "priority",
  "timestamp::text",
  "altitude",
  "longitude",
  "latitude",
  "angle",
  "satellites",
  "speed",
  `vehicle_id AS "vehicleId"`
]
  .map(column => "avl." + column)
  .join(", ");

export function getAvlFromAvlId(avlId: number) {
  const GET_AVL_FROM_AVL_ID = `SELECT ${AVL_COLUMNS} FROM AVL WHERE id = $1 LIMIT 1`;
  return database
    .query<AVL>(GET_AVL_FROM_AVL_ID, [avlId])
    .then(results => results.rows[0]);
}

export function getAvlsFromDate(
  _: void,
  { date = DateTime.local().toSQL() }: { date: ?string }
) {
  const GET_AVLS_WITH_DATE = `
  SELECT ${AVL_COLUMNS} FROM avl 
    WHERE timestamp::DATE = $1::DATE 
    ORDER BY timestamp
  `;
  return database
    .query<AVL>(GET_AVLS_WITH_DATE, [date])
    .then(results => results.rows);
}

export function getLatestAvlFromVehicleId(vehicleId: number) {
  const GET_LATEST_AVL_FROM_VEHICLE_ID = `
    SELECT ${AVL_COLUMNS} FROM avl WHERE vehicle_id = $1 AND satellites > 3 ORDER BY timestamp DESC LIMIT 1
  `;

  return database
    .query<AVL>(GET_LATEST_AVL_FROM_VEHICLE_ID, [vehicleId])
    .then(results => results.rows[0]);
}

export function getLatestAvlFromTripId(tripId: number) {
  const GET_LATEST_AVL_FROM_TRIP_ID = `
    SELECT ${AVL_COLUMNS} FROM avl
      INNER JOIN avl_trip ON avl.id = avl_trip.avl_id
      WHERE trip_id = $1
      ORDER BY avl.timestamp DESC
      LIMIT 1
  `;

  return database
    .query<?AVL>(GET_LATEST_AVL_FROM_TRIP_ID, [tripId])
    .then(results => results.rows[0]);
}

export function getAvlOfLastTerminalExitFromVehicleId(
  vehicleId: number,
  beforeTimestamp?: string = DateTime.local().toSQL()
) {
  const GET_AVL_OF_LAST_TERMINAL_EXIT_FROM_VEHICLE_ID = `
    SELECT ${AVL_COLUMNS} FROM avl
      INNER JOIN bus_stop_visits ON bus_stop_visits.avl_id = avl.id
      INNER JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
      WHERE avl.vehicle_id = $1
      AND bus_stops.is_terminal
      AND avl.timestamp < $2::timestamp
      ORDER BY avl.timestamp DESC
      LIMIT 1
  `;
  return database
    .query<AVL>(GET_AVL_OF_LAST_TERMINAL_EXIT_FROM_VEHICLE_ID, [
      vehicleId,
      beforeTimestamp
    ])
    .then(results => {
      if (results.rows.length) {
        return results.rows[0];
      } else {
        throw new Error("No last terminal exit found");
      }
    });
}
