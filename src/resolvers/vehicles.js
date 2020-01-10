// @flow

import database from "../database/database";

export type Vehicle = {|
  id: number,
  registration: string,
  imei: string
|};

const GET_ALL_VEHICLES = `SELECT * FROM vehicles`;
const GET_VALID_IMEIS = `SELECT imei FROM vehicles`;

export function getVehicle() {
  return database
    .query<Vehicle>(GET_ALL_VEHICLES)
    .then(results => results.rows);
}

export function getValidImeis() {
  return database.query<string>(GET_VALID_IMEIS).then(results => results.rows);
}
