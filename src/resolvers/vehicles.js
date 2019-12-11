// @flow

import database from "../database/database";

export type Vehicle = {|
  id: number,
  registration: string,
  imei: string,
|};

const GET_ALL_VEHICLES = `SELECT * FROM vehicles`;

export function getVehicle() {
  return database
    .query<Vehicle>(GET_ALL_VEHICLES)
    .then(results => results.rows);
}
