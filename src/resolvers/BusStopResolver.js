// @flow

import { DateTime } from "luxon";
import database from "../database/database";
import { getAvlOfLastTerminalExitFromVehicleId } from "./AvlResolver";

export const BUS_STOP_COLUMNS = [
  "id",
  "name",
  "street",
  "icon",
  "url",
  "direction",
  "latitude",
  "longitude",
  `road_angle AS "roadAngle"`,
  `is_terminal AS "isTerminal"`,
  `will_wait AS "willWait"`
]
  .map(column => "bus_stops." + column)
  .join(", ");

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

// Find last bus stop id in the visited set that matches any bus stops defined in the trip.
// The upcoming bus stops are the ones that follow it as defined in the trip.
export async function getUpcomingBusStopsFromTripId(
  tripId: number,
  visitedBusStopIds: number[]
): Promise<BusStop[]> {
  const tripBusStops = await getBusStopsFromTripId(tripId);

  // Remove first terminal stop since it has already departed
  if (tripBusStops.length > 1 && tripBusStops[0].isTerminal) {
    tripBusStops.shift();
  }

  const tripBusStopIds = tripBusStops.map(busStop => busStop.id);

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
      INNER JOIN bus_stop_visits ON bus_stop_visits.avl_id = avl.id
      INNER JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
      WHERE is_proxy = false
    `;

  return database
    .query<BusStop>(GET_BUS_STOP_FROM_AVL_ID, [avlId])
    .then(results => (results.rows.length ? results.rows[0] : null));
}

export function getBusStopsVisitedTodayFromTripId(tripId: number) {
  const BUS_STOPS_VISITED = `
    WITH bus_stop_ids AS (
      SELECT bus_stop_id AS id, MIN(avl.timestamp) AS timestamp FROM bus_stop_visits 
        INNER JOIN avl ON avl.id = bus_stop_visits.avl_id
        WHERE scheduled_departure_id IN (
        SELECT id FROM scheduled_departures WHERE trip_id = $1
      ) AND avl.timestamp::DATE = now()::DATE
      GROUP BY bus_stop_id
      ORDER BY timestamp
    )

    SELECT ${BUS_STOP_COLUMNS} FROM bus_stop_ids
      INNER JOIN bus_stops ON bus_stops.id = bus_stop_ids.id;
  `;

  return database
    .query<BusStop>(BUS_STOPS_VISITED, [tripId])
    .then(results => results.rows);
}

export async function getNearbyBusStopsFromLocation(
  longitude: number,
  latitude: number,
  angle: number
) {
  const GEOFENCE_RADIUS = 0.001;
  const ANGLE_BUFFER = 45;
  const GET_NEARBY_BUS_STOPS_FROM_LOCATION = `
    WITH bus_stops AS (
      SELECT bus_stops.id, bus_stops.url, bus_stops.name, bus_stops.street, bus_stops.direction, bus_stops.icon, 
      bus_stop_proxies.longitude, bus_stop_proxies.latitude, bus_stops.road_angle, bus_stops.is_terminal, 
      bus_stops.display_position, true as is_proxy, bus_stops.will_wait FROM bus_stops 
      INNER JOIN bus_stop_proxies ON bus_stops.id = bus_stop_proxies.bus_stop_id 
      UNION SELECT *, false as is_proxy FROM bus_stops
    )


    SELECT ${BUS_STOP_COLUMNS}, is_proxy AS "isProxy" FROM bus_stops
      WHERE CIRCLE(POINT(bus_stops.longitude, bus_stops.latitude), ${GEOFENCE_RADIUS}) @> POINT($1, $2)
      AND (
        bus_stops.road_angle IS NULL
          OR ABS(bus_stops.road_angle - $3) < ${ANGLE_BUFFER}
          OR ABS(bus_stops.road_angle - $3) > ${360 - ANGLE_BUFFER}
      )
  `;
  return database
    .query<{| ...BusStop, isProxy: boolean |}>(
      GET_NEARBY_BUS_STOPS_FROM_LOCATION,
      [longitude, latitude, angle]
    )
    .then(results =>
      results.rows.map<{ busStop: BusStop, isProxy: boolean }>(
        ({ isProxy, ...busStop }) => ({ busStop, isProxy })
      )
    );
}
