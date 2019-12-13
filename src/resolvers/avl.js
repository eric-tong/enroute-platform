// @flow

import { DateTime } from "luxon";
import type { Vehicle } from "./vehicles";
import database from "../database/database";

export type AVL = {|
  id: number,
  timestamp: DateTime,
  longitude: number,
  latitude: number,
  angle: number,
  speed: number,
|};

const GET_ALL_AVL_WITH_DATE = `SELECT * FROM avl WHERE DATE(timestamp) = DATE($1) ORDER BY timestamp DESC`;
const GET_AVL_OF_VEHICLE = `SELECT * FROM avl WHERE vehicle_id = $1 ORDER BY timestamp DESC LIMIT 1`;

export function getAvl(
  _: void,
  { date = DateTime.local().toSQL() }: { date: ?string }
) {
  return database
    .query<AVL>(GET_ALL_AVL_WITH_DATE, [date])
    .then(results => results.rows);
}

export function getLatestAvlOfVehicle(vehicle: Vehicle) {
  return database
    .query<AVL>(GET_AVL_OF_VEHICLE, [vehicle.id])
    .then(results => results.rows[0]);
}
