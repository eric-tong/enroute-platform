// @flow

import { DateTime, Interval } from "luxon";

import type { AVLData } from "../trackers/codec8Schema";
import database from "../database/database";
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
  MAX(CASE WHEN CIRCLE(POINT(bus_stops.longitude, bus_stops.latitude), 0.001) @> POINT(avls.longitude, avls.latitude) 
    THEN bus_stops.id ELSE 0 END) AS bus_stop_id
    FROM bus_stops CROSS JOIN avls
    GROUP BY avl_id
)

SELECT avl.id AS "avlId", avl.timestamp, POINT(avl.longitude, avl.latitude) as "avlCoords", avl.vehicle_id as vehicleId,
       bus_stops.id AS "nearbyBusStopId", POINT(bus_stops.longitude, bus_stops.latitude) as "nearbyBusStopCoords",
       bus_stops.is_terminal AS "isInTerminal"
  FROM nearby_bus_stops
  LEFT JOIN avl ON nearby_bus_stops.avl_id = avl.id
  LEFT JOIN bus_stops ON nearby_bus_stops.bus_stop_id = bus_stops.id;
`;
const INSERT_VEHICLE_STATE_TRANSITION = `
INSERT INTO vehicle_state_transitions (vehicle_id, timestamp, transition, bus_stop_id, initial_avl_id, final_avl_id)
  VALUES($1, $2, $3, $4, $5, $6)
`;
const GET_AVL_ID_IN_DATE =
  "SELECT id FROM avl WHERE DATE(timestamp) = DATE($1)";

type AVLToBusStop = {
  avlId: number,
  timestamp: string,
  avlCoords: { x: number, y: number },
  vehicleId: number,
  nearbyBusStopId: ?number,
  nearbyBusStopCoords: ?{ x: number, y: number },
  isInTerminal: ?boolean
};

export async function checkStateTransition(avlId: number) {
  const avls = await database
    .query<AVLToBusStop>(GET_NEARBY_BUS_STOPS, [avlId])
    .then(results => results.rows);

  // No transition has occurred
  if (avls.length < 2 || avls[0].nearbyBusStopId === avls[1].nearbyBusStopId) {
    console.log("Transition", "No transition has occurred");
    return;
  }

  const [finalAvl, initialAvl] = avls;
  const action = finalAvl.nearbyBusStopId ? "enter" : "exit";
  const { vehicleId, nearbyBusStopId, nearbyBusStopCoords, isInTerminal } =
    action === "enter" ? finalAvl : initialAvl;

  const transition = `${action}_${isInTerminal ? "terminal" : "bus_stop"}`;
  const timestamp = DateTime.fromMillis(
    (DateTime.fromSQL(finalAvl.timestamp).toMillis() +
      DateTime.fromSQL(initialAvl.timestamp).toMillis()) /
      2
  );

  console.log("Transition", {
    vehicleId,
    timestamp,
    transition,
    nearbyBusStopId,
    initialAvl: initialAvl.avlId,
    finalAvl: finalAvl.avlId
  });

  return database.query<{}>(INSERT_VEHICLE_STATE_TRANSITION, [
    vehicleId,
    timestamp,
    transition,
    nearbyBusStopId,
    initialAvl.avlId,
    finalAvl.avlId
  ]);
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
