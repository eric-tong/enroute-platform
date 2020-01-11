// @flow

import type { AVLData } from "../trackers/codec8Schema";
import { DateTime } from "luxon";
import type { Point } from "../utils/geometryUtils";
import database from "../database/database";
import { findParametricValueAtBoundary } from "../utils/geometryUtils";
import { getBusStops } from "../resolvers/busStops";

const GEOFENCE_RADIUS = 0.001;
// TODO Check for angle when matching bus stops;
const GET_NEARBY_BUS_STOPS = `
WITH final_avl AS (
  SELECT timestamp, vehicle_id FROM avl WHERE id = $1
),
avls AS (
  SELECT id, longitude, latitude FROM avl 
    WHERE timestamp <= (SELECT timestamp FROM final_avl)
    AND satellites > 3
    AND vehicle_id = (SELECT vehicle_id FROM final_avl)
    ORDER BY timestamp DESC
    LIMIT 2
),
nearby_bus_stops AS (
  SELECT avls.id AS avl_id,
  MAX(CASE WHEN CIRCLE(POINT(bus_stops.longitude, bus_stops.latitude), ${GEOFENCE_RADIUS}) @> POINT(avls.longitude, avls.latitude) 
    THEN bus_stops.id ELSE 0 END) AS bus_stop_id
    FROM bus_stops CROSS JOIN avls
    GROUP BY avl_id
)

SELECT avl.id AS "avlId", avl.timestamp, POINT(avl.longitude, avl.latitude) as "avlCoords", avl.vehicle_id as "vehicleId",
       bus_stops.id AS "nearbyBusStopId", POINT(bus_stops.longitude, bus_stops.latitude) as "nearbyBusStopCoords",
       bus_stops.is_terminal AS "isInTerminal"
  FROM nearby_bus_stops
  LEFT JOIN avl ON nearby_bus_stops.avl_id = avl.id
  LEFT JOIN bus_stops ON nearby_bus_stops.bus_stop_id = bus_stops.id
  ORDER BY avl.timestamp DESC
`;
const INSERT_VEHICLE_STATE_TRANSITION = `
INSERT INTO vehicle_state_transitions (vehicle_id, timestamp, transition, bus_stop_id, initial_avl_id, final_avl_id)
  VALUES($1, $2, $3, $4, $5, $6)
`;
const GET_AVL_ID_IN_DATE =
  "SELECT id FROM avl WHERE DATE(timestamp) = DATE($1)";

type AVLToBusStop = {
  avlId: number,
  timestamp: Date,
  avlCoords: Point,
  vehicleId: number,
  nearbyBusStopId: ?number,
  nearbyBusStopCoords: ?Point,
  isInTerminal: ?boolean
};

export async function checkStateTransition(avlId: number) {
  const avls = await database
    .query<AVLToBusStop>(GET_NEARBY_BUS_STOPS, [avlId])
    .then(results => results.rows);

  // No transition has occurred
  if (avls.length < 2 || avls[0].nearbyBusStopId === avls[1].nearbyBusStopId)
    return;

  const [finalAvl, initialAvl] = avls;
  const action = finalAvl.nearbyBusStopId ? "enter" : "exit";
  const { vehicleId, nearbyBusStopId, nearbyBusStopCoords, isInTerminal } =
    action === "enter" ? finalAvl : initialAvl;

  const transition = `${action}_${isInTerminal ? "terminal" : "bus_stop"}`;
  const closenessToInitialAvl = findParametricValueAtBoundary(
    initialAvl.avlCoords,
    finalAvl.avlCoords,
    nearbyBusStopCoords ?? { x: 0, y: 0 },
    GEOFENCE_RADIUS
  );
  const timestamp = DateTime.fromMillis(
    initialAvl.timestamp.getTime() * closenessToInitialAvl +
      initialAvl.timestamp.getTime() * (1 - closenessToInitialAvl)
  ).toSQL();

  console.log("Transition", {
    vehicleId,
    timestamp,
    transition,
    nearbyBusStopId,
    initialAvl: initialAvl.avlId,
    finalAvl: finalAvl.avlId
  });

  database
    .query<{}>(INSERT_VEHICLE_STATE_TRANSITION, [
      vehicleId,
      timestamp,
      transition,
      nearbyBusStopId,
      initialAvl.avlId,
      finalAvl.avlId
    ])
    .catch(console.log);
}

export function checkStateTransitionInDate(
  date: string = DateTime.local().toSQL()
) {
  return database
    .query<{ id: number }>(GET_AVL_ID_IN_DATE, [date])
    .then(results => results.rows.map(avl => avl.id))
    .then(avlIds => avlIds.forEach(checkStateTransition))
    .catch(console.log);
}
