// @flow

import {
  getAvlFromAvlId,
  getLatestAvlFromTripId,
  getLatestAvlFromVehicleId
} from "./AvlResolver";
import {
  getScheduledDeparturesExceptLastInTripFromBusStopId,
  getScheduledDeparturesFromTripId
} from "./ScheduledDepartureResolver";

import { BUS_STOP_VISIT_COLUMNS } from "./BusStopVisitResolver";
import { DateTime } from "luxon";
import database from "../database/database";
import { getAllPredictedBusArrivals } from "../vehicleStatus/VehicleStatusGetter";
import { getBusStopFromAvlId } from "./BusStopResolver";
import { getPredictedDepartureTodayFromScheduledDepartureId } from "./PredictedDepartureResolver";
import { toActualTime } from "../utils/TimeUtils";

export async function getAllDeparturesFromBusStop(
  busStop: BusStop,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength?: number }
) {
  return getScheduledDeparturesExceptLastInTripFromBusStopId(
    busStop.id
  ).then(scheduledDepartures =>
    Promise.all(scheduledDepartures.map(getDepartureFromScheduledDeparture))
  );
}

export async function getAllDeparturesFromTripId(
  tripId: number,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength?: number }
) {
  return getScheduledDeparturesFromTripId(tripId).then(scheduledDepartures =>
    Promise.all(scheduledDepartures.map(getDepartureFromScheduledDeparture))
  );
}

export async function getDepartureFromScheduledDeparture(
  scheduledDeparture: ScheduledDeparture
): Promise<Departure> {
  const [predictedDeparture, actualDeparture] = await Promise.all([
    getPredictedDepartureTodayFromScheduledDepartureId(scheduledDeparture.id),
    getActualDepartureTodayFromScheduledDepartureId(scheduledDeparture.id)
  ]);
  const isAtBusStop = await getLatestAvlFromTripId(scheduledDeparture.tripId)
    .then(avl => getBusStopFromAvlId(avl.id))
    .then(busStop => !!busStop && busStop.id === scheduledDeparture.busStopId);

  return {
    scheduledDeparture,
    predictedDeparture,
    actualDeparture,
    isAtBusStop
  };
}

function getActualDepartureTodayFromScheduledDepartureId(
  scheduledDepartureId: number
) {
  const GET_ACTUAL_DEPARTURE_TODAY_FROM_SCHEDULED_DEPARTURE_ID = `
    SELECT ${BUS_STOP_VISIT_COLUMNS} FROM bus_stop_visits
      INNER JOIN avl ON avl.id = bus_stop_visits.avl_id
      WHERE bus_stop_visits.scheduled_departure_id = $1
      AND avl.timestamp::DATE = now()::DATE
      ORDER BY avl.timestamp DESC
      LIMIT 1
  `;
  return database
    .query<BusStopVisit>(
      GET_ACTUAL_DEPARTURE_TODAY_FROM_SCHEDULED_DEPARTURE_ID,
      [scheduledDepartureId]
    )
    .then(results => results.rows[0]);
}
