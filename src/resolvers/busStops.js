// @flow

import database from "../database/database";

export type BusStop = {|
  id: number,
  name: string,
  street: string,
  longitude: number,
  latitude: number,
  icon: string
|};

const GET_ALL_BUS_STOPS = `SELECT * FROM bus_stops ORDER BY display_position`;
const GET_ALL_BUS_STOPS_IN_ORDER = `
SELECT longitude, latitude FROM bus_stops INNER JOIN departures 
  ON bus_stops.id = departures.bus_stop_id
  WHERE departures.trip_id = 1
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
