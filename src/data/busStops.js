// @flow

import type { Coordinates } from "../DataTypes";
import database from "./database";

export type BusStop = {|
  id: number,
  name: string,
  street: string,
  coords: Coordinates,
  icon: string,
|};

const GET_ALL_BUS_STOPS = `SELECT * FROM "busStops"`;
const GET_ALL_BUS_STOPS_IN_ORDER = `
SELECT coords FROM "busStops" INNER JOIN arrivals 
  ON "busStops".id = arrivals."busStopId"
  WHERE arrivals."tripId" = 1
  ORDER BY time
`;

export function getBusStops() {
  return database
    .query<BusStop>(GET_ALL_BUS_STOPS)
    .then(results => results.rows);
}

export function getBusStopsInOrder() {
  return database
    .query<BusStop>(GET_ALL_BUS_STOPS_IN_ORDER)
    .then(results => results.rows);
}
