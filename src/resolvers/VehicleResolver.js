// @flow

import database from "../database/database";

const SELECT_VEHICLE_WITH_IMEI = `SELECT imei FROM vehicles WHERE imei = $1`;

export function getAllVehicles() {
  const GET_ALL_VEHICLES = "SELECT * FROM vehicles";
  return database
    .query<Vehicle>(GET_ALL_VEHICLES)
    .then(results => results.rows);
}

export function imeiIsValid(imei: string) {
  return database
    .query<{ imei: string }>(SELECT_VEHICLE_WITH_IMEI, [imei])
    .then(results => results.rows.length > 0);
}
