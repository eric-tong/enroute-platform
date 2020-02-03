// @flow

import database from "../database/database";

const TABLE_NAMES = [
  "bus_stop_visits",
  "bus_stop_proxies",
  "scheduled_departures",
  "predicted_departures",
  "avl",
  "avl_trip_id",
  "bus_stops",
  "check_ins",
  "departments",
  "io",
  "io_names",
  "vehicles",
  "routes",
  "trips"
];

export async function clearTables() {
  for (const name of TABLE_NAMES) {
    await database.query(`DELETE FROM ${name}`);
  }
}

export function randomId(max?: number = 2e9) {
  return Math.floor(Math.random() * max);
}
