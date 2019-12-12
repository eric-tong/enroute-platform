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

const GET_ALL_VEHICLES = `SELECT * FROM avl WHERE vehicle_id = $1 ORDER BY timestamp DESC LIMIT 1`;

export function getLatestAvlOfVehicle(vehicle: Vehicle) {
  return database
    .query<AVL>(GET_ALL_VEHICLES, [vehicle.id])
    .then(results => results.rows[0]);
}
