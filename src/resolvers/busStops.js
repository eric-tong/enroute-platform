// @flow

import { DateTime } from "luxon";
import type { Status } from "../predictor/vehicleStatus";
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
  WHERE departures.trip_id = $1
  ORDER BY time
`;
const GET_CURRENT_BUS_STOP = `
WITH latest_avl AS (
  SELECT * FROM avl WHERE vehicle_id = $1 AND timestamp <= $2 ORDER BY timestamp DESC LIMIT 1
)

SELECT bus_stops.id AS "currentBusStopId", bus_stops.is_terminal AS "isInTerminal" FROM latest_avl
  LEFT JOIN bus_stop_visits ON bus_stop_visits.avl_id = latest_avl.id
  LEFT JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
`;
const BUS_STOPS_VISITED = `
WITH last_terminal_exit AS (
  SELECT avl.timestamp FROM avl
      INNER JOIN bus_stop_visits ON bus_stop_visits.avl_id = avl.id
      INNER JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
      WHERE vehicle_id = $1
      AND avl.timestamp <= $2
      AND bus_stops.is_terminal
      ORDER BY avl.timestamp DESC
      LIMIT 1
),
visited_bus_stops_in_current_trip AS (
SELECT bus_stops.id, ROW_NUMBER() OVER (PARTITION BY bus_stops.id ORDER BY avl.timestamp) AS id_within_bus_stop FROM avl
    INNER JOIN bus_stop_visits ON bus_stop_visits.avl_id = avl.id
    INNER JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
    WHERE avl.vehicle_id = $1
    AND avl.timestamp >= (SELECT timestamp FROM last_terminal_exit)
    AND avl.timestamp <= $2
    ORDER BY avl.timestamp
)

SELECT id FROM visited_bus_stops_in_current_trip WHERE id_within_bus_stop = 1
`;

export function getBusStops() {
  return database
    .query<BusStop>(GET_ALL_BUS_STOPS)
    .then(results => results.rows);
}

export function getBusStopsInOrder(tripId: number) {
  return database
    .query<BusStop>(GET_ALL_BUS_STOPS_IN_ORDER, [tripId])
    .then(results => results.rows);
}

export async function getUpcomingBusStopsOfTrip(
  tripId: number,
  idsOfBusStopsVisited: number[]
): Promise<BusStop[]> {
  const busStops = await getBusStopsInOrder(tripId);
  const busStopsVisitedSet = new Set(idsOfBusStopsVisited);

  return busStops.filter(busStop => {
    if (busStopsVisitedSet.has(busStop.id)) {
      busStopsVisitedSet.delete(busStop.id);
      return false;
    } else {
      return true;
    }
  });
}

export function getCurrentBusStopOfVehicle(
  vehicleId: number,
  beforeTimestamp: string = DateTime.local().toSQL()
) {
  return database
    .query<{ currentBusStopId: ?number, isInTerminal: ?boolean }>(
      GET_CURRENT_BUS_STOP,
      [vehicleId, beforeTimestamp]
    )
    .then(results => results.rows[0])
    .then(busStop => ({ ...busStop, isInTerminal: !!busStop.isInTerminal }));
}

export function getBusStopsVisitedByVehicle(
  vehicleId: number,
  beforeTimestamp: string = DateTime.local().toSQL()
) {
  return database
    .query<{ id: number }>(BUS_STOPS_VISITED, [vehicleId, beforeTimestamp])
    .then(results => results.rows.map<number>(row => row.id));
}
