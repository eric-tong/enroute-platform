// @flow

import {
  AVL_COLUMNS,
  getAvlFromAvlId,
  getLatestAvlFromTripId,
  getLatestAvlFromVehicleId
} from "./AvlResolver";
import {
  getScheduledDeparturesExceptLastInTripFromBusStopId,
  getScheduledDeparturesFromTripId
} from "./ScheduledDepartureResolver";

import { DateTime } from "luxon";
import database from "../database/database";
import { getBusStopFromAvlId } from "./BusStopResolver";
import { getPredictedDepartureTodayFromScheduledDepartureId } from "./PredictedDepartureResolver";
import { toActualTime } from "../utils/TimeUtils";

const DEPARTED_BUFFER = 3;

export async function getUpcomingDeparturesFromBusStop(
  busStop: BusStop,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength?: number }
) {
  const departures = await getAllDeparturesFromBusStopId(busStop.id);

  // $FlowFixMe flow filter bug
  return departures
    .filter(
      ({
        scheduledDeparture,
        predictedDeparture,
        actualDeparture,
        isAtBusStop
      }: Departure) => {
        if (isAtBusStop) return true;
        const cutOffTime = DateTime.local().plus({ minutes: DEPARTED_BUFFER });
        if (actualDeparture) {
          const actualTime = DateTime.fromSQL(actualDeparture.timestamp);
          return actualTime.valueOf() > cutOffTime.valueOf();
        }
        if (predictedDeparture) {
          return true;
        }
        return (
          toActualTime(scheduledDeparture.minuteOfDay).valueOf() >
          cutOffTime.valueOf()
        );
      }
    )
    .slice(0, maxLength);
}

export async function getAllDeparturesFromBusStopId(
  busStopId: number
): Promise<Departure[]> {
  return getScheduledDeparturesExceptLastInTripFromBusStopId(
    busStopId
  ).then(scheduledDepartures =>
    Promise.all(scheduledDepartures.map(getDepartureFromScheduledDeparture))
  );
}

export async function getAllDeparturesFromTripId(tripId: number) {
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
  const latestAvl = await getLatestAvlFromTripId(scheduledDeparture.tripId);
  const isAtBusStop =
    !!latestAvl &&
    (await getBusStopFromAvlId(latestAvl.id).then(
      busStop => !!busStop && busStop.id === scheduledDeparture.busStopId
    ));

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
    SELECT ${AVL_COLUMNS} FROM bus_stop_visits
      INNER JOIN avl ON avl.id = bus_stop_visits.avl_id
      WHERE bus_stop_visits.scheduled_departure_id = $1
      AND avl.timestamp::DATE = now()::DATE
      ORDER BY avl.timestamp DESC
      LIMIT 1
  `;
  return database
    .query<AVL>(GET_ACTUAL_DEPARTURE_TODAY_FROM_SCHEDULED_DEPARTURE_ID, [
      scheduledDepartureId
    ])
    .then(results => results.rows[0]);
}
