// @flow

import database from "../database/database";

export function getAllVehicles() {
  const GET_ALL_VEHICLES = "SELECT * FROM vehicles";
  return database
    .query<Vehicle>(GET_ALL_VEHICLES)
    .then(results => results.rows);
}

export function getVehicleFromRegistration(registration: string) {
  const GET_VEHICLE_FROM_REGISTRATION = `SELECT * FROM vehicles WHERE LOWER(registration) = LOWER($1)`;
  return database
    .query<Vehicle>(GET_VEHICLE_FROM_REGISTRATION, [registration])
    .then(results => (results.rows.length ? results.rows[0] : undefined));
}

export function getVehicleFromImei(imei: string) {
  const GET_VEHICLE_FROM_IMEI = `SELECT * FROM vehicles WHERE imei = $1`;
  return database
    .query<Vehicle>(GET_VEHICLE_FROM_IMEI, [imei])
    .then(results => (results.rows.length ? results.rows[0] : undefined));
}
