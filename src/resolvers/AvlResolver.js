// @flow

import type { AVL } from "../graphql/AvlSchema";
import { DateTime } from "luxon";
import type { Vehicle } from "../graphql/VehicleSchema";
import database from "../database/database";

const GET_AVL_OF_VEHICLE = `SELECT *, vehicle_id as "vehicleId" FROM avl WHERE vehicle_id = $1 AND satellites > 3 ORDER BY timestamp DESC LIMIT 1`;

export function getAllAvlsFromDate(
  _: void,
  { date = DateTime.local().toSQL() }: { date: ?string }
) {
  const GET_AVLS_WITH_DATE = `
  SELECT *, vehicle_id as "vehicleId" FROM avl 
    WHERE timestamp::DATE = $1::DATE 
    ORDER BY timestamp
  `;
  return database
    .query<AVL>(GET_AVLS_WITH_DATE, [date])
    .then(results => results.rows);
}

export function getLatestAvlOfVehicle(vehicle: Vehicle) {
  return database
    .query<AVL>(GET_AVL_OF_VEHICLE, [vehicle.id])
    .then(results => results.rows[0]);
}
