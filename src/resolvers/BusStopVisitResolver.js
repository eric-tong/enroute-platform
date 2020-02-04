// @flow

import {
  getTripIdFromAvlId,
  getTripIdWithNearestStartTime
} from "./TripResolver";

import { DateTime } from "luxon";
import database from "../database/database";
import { getAvlOfLastTerminalExitFromVehicleId } from "./AvlResolver";
import { getNearbyBusStopsFromLocation } from "./BusStopResolver";
import { getScheduledDepartureFromBusStopIdAndTripId } from "./ScheduledDepartureResolver";

export const BUS_STOP_VISIT_COLUMNS = [
  `avl_id AS "avlId"`,
  `bus_stop_id AS "busStopId"`,
  `scheduled_departure_id AS "scheduledDepartureId"`,
  `is_proxy AS "isProxy"`
]
  .map(column => "bus_stop_visits." + column)
  .join(", ");

export async function insertBusStopVisitFromAvl(avl: AVL) {
  const [nearbyBusStops, tripId] = await Promise.all([
    getNearbyBusStopsFromLocation(avl.longitude, avl.latitude, avl.angle),
    getTripIdFromAvlId(avl.id)
  ]);

  const INSERT_INTO_BUS_STOP_VISIT = `
    INSERT INTO bus_stop_visits (avl_id, bus_Stop_id, scheduled_departure_id, is_proxy)
      VALUES ($1, $2, $3, $4)
  `;

  return Promise.all(
    nearbyBusStops.map(nearbyBusStop =>
      getScheduledDepartureFromBusStopIdAndTripId(
        nearbyBusStop.busStop.id,
        tripId
      ).then(scheduledDeparture =>
        database.query<{}>(INSERT_INTO_BUS_STOP_VISIT, [
          avl.id,
          nearbyBusStop.busStop.id,
          scheduledDeparture ? scheduledDeparture.id : null,
          nearbyBusStop.isProxy
        ])
      )
    )
  );
}

export function getBusStopVisitFromAvlId(avlId: number) {
  const GET_BUS_STOP_VISIT_FROM_AVL_ID = `SELECT ${BUS_STOP_VISIT_COLUMNS} FROM bus_stop_visits WHERE avl_id = $1`;
  return database
    .query<BusStopVisit>(GET_BUS_STOP_VISIT_FROM_AVL_ID, [avlId])
    .then(results => results.rows[0]);
}
