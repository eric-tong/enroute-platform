// @flow

import type { BusStop } from "../graphql/BusStopSchema";
import { DateTime } from "luxon";
import type { Status } from "../vehicleStatus/VehicleStatusUpdater";
import database from "../database/database";

const BUS_STOP_COLUMNS = [
  "id",
  "name",
  "street",
  "icon",
  "url",
  "direction",
  "latitude",
  "longitude",
  `road_angle AS "roadAngle"`,
  `is_terminal AS "isTerminal"`
]
  .map(column => "bus_stops." + column)
  .join(", ");

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

export function getAllBusStops() {
  const GET_ALL_BUS_STOPS = `SELECT ${BUS_STOP_COLUMNS} FROM bus_stops ORDER BY display_position`;
  return database
    .query<BusStop>(GET_ALL_BUS_STOPS)
    .then(results => results.rows);
}

export function getBusStopFromUrl(_: void, { url }: { url: string }) {
  const GET_BUS_STOP_FROM_URL = `SELECT ${BUS_STOP_COLUMNS} FROM bus_stops WHERE url = $1 LIMIT 1`;
  return database
    .query<BusStop>(GET_BUS_STOP_FROM_URL, [url])
    .then(results => results.rows.length && results.rows[0]);
}

export function getBusStopFromId(busStopId: number) {
  const GET_BUS_STOP_FROM_ID = `SELECT ${BUS_STOP_COLUMNS} FROM bus_stops WHERE id = $1`;
  return database
    .query<BusStop>(GET_BUS_STOP_FROM_ID, [busStopId])
    .then(results => results.rows.length && results.rows[0]);
}

export function getBusStopsFromTripId(tripId: number) {
  const GET_BUS_STOPS_IN_TRIP = `
    SELECT ${BUS_STOP_COLUMNS} FROM bus_stops INNER JOIN scheduled_departures 
      ON bus_stops.id = scheduled_departures.bus_stop_id
      WHERE scheduled_departures.trip_id = $1
      ORDER BY minute_of_day
    `;

  return database
    .query<BusStop>(GET_BUS_STOPS_IN_TRIP, [tripId])
    .then(results => results.rows);
}

export async function getUpcomingBusStopsFromTripId(
  tripId: number,
  visitedBusStopIds: number[]
): Promise<BusStop[]> {
  const tripBusStops = await getBusStopsFromTripId(tripId);
  const tripBusStopIds = tripBusStops.map(busStop => busStop.id);

  // Find last bus stop id in the visited set that matches any bus stops defined in the trip.
  // The upcoming bus stops are the ones that follow it as defined in the trip.

  let tripIndex = 0;
  visitedBusStopIds.forEach(visitedId => {
    const matchedIndex = tripBusStopIds.indexOf(visitedId, tripIndex);
    if (matchedIndex > -1) {
      tripIndex = matchedIndex + 1;
    }
  });

  return tripBusStops.slice(tripIndex);
}

export function getBusStopFromAvlId(avlId: number) {
  const GET_BUS_STOP_FROM_AVL_ID = `
    WITH avl AS (
      SELECT * FROM avl WHERE id = $1 LIMIT 1
    )
    
    SELECT ${BUS_STOP_COLUMNS} FROM avl
      LEFT JOIN bus_stop_visits ON bus_stop_visits.avl_id = avl.id
      LEFT JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
    `;

  return database
    .query<BusStop>(GET_BUS_STOP_FROM_AVL_ID, [avlId])
    .then(results => (results.rows.length ? results.rows[0] : null));
}

export function getBusStopsVisitedByVehicle(
  vehicleId: number,
  beforeTimestamp: string = DateTime.local().toSQL()
) {
  return database
    .query<{ id: number }>(BUS_STOPS_VISITED, [vehicleId, beforeTimestamp])
    .then(results => results.rows.map<number>(row => row.id));
}
