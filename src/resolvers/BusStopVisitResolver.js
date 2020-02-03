// @flow

import { DateTime } from "luxon";
import database from "../database/database";
import { getScheduledDepartureFromBusStopIdAndTripId } from "./ScheduledDepartureResolver";

export const BUS_STOP_VISIT_COLUMNS = [
  `avl_id AS "avlId"`,
  `bus_stop_id AS "busStopId"`,
  `scheduled_departure_id AS "scheduledDepartureId"`,
  `is_proxy AS "isProxy"`
]
  .map(column => "bus_stop_visits." + column)
  .join(", ");

export const GEOFENCE_RADIUS = 0.001;
export const ANGLE_BUFFER = 45;
const GET_AVL_ID_IN_DATE =
  "SELECT id FROM avl WHERE DATE(timestamp) = DATE($1) ORDER BY timestamp DESC";

export async function insertBusStopVisitFromAvl(
  avl: AVL,
  table?: string = "bus_stops",
  isProxy: boolean = false
) {
  const INSERT_BUS_STOP_VISIT_FROM_AVL_ID = `
    WITH avl AS (
        SELECT id, longitude, latitude, angle FROM avl WHERE id = $1
    )

    INSERT INTO bus_stop_visits (avl_id, bus_stop_id, is_proxy)
    SELECT avl.id as avl_id, ${table}.id as bus_stop_id, ${
    isProxy ? "true" : "false"
  } as is_proxy
        FROM ${table} CROSS JOIN avl
        WHERE CIRCLE(POINT(${table}.longitude, ${table}.latitude), ${GEOFENCE_RADIUS}) @> POINT(avl.longitude, avl.latitude)
        AND (
          ${table}.road_angle IS NULL
            OR ABS(${table}.road_angle - avl.angle) < ${ANGLE_BUFFER}
            OR ABS(${table}.road_angle - avl.angle) > ${360 - ANGLE_BUFFER}
        )
        RETURNING *
    `;
  return database.query<{}>(INSERT_BUS_STOP_VISIT_FROM_AVL_ID, [avl.id]);
}

export function insertBusStopProxyVisitFromAvl(avl: AVL) {
  return insertBusStopVisitFromAvl(avl, "bus_stop_proxies", true);
}

export function getBusStopVisitFromAvlId(avlId: number) {
  const GET_BUS_STOP_VISIT_FROM_AVL_ID = `SELECT ${BUS_STOP_VISIT_COLUMNS} FROM bus_stop_visits WHERE avl_id = $1`;
  return database
    .query<BusStopVisit>(GET_BUS_STOP_VISIT_FROM_AVL_ID, [avlId])
    .then(results => results.rows[0]);
}
