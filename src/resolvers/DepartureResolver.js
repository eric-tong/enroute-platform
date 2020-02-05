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

const DEPARTED_BUFFER_SHORT = 3;
const DEPARTED_BUFFER_LONG = 10;

export async function getUpcomingDeparturesFromBusStop(
  busStop: BusStop,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength?: number }
) {
  const departures = await getAllDeparturesFromBusStopId(busStop.id);

  // $FlowFixMe flow filter bug
  return departures.filter(isUpcomingDeparture).slice(0, maxLength);
}

export async function getUpcomingDeparturesFromTripId(
  tripId: number,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength?: number }
) {
  const departures = await getAllDeparturesFromTripId(tripId);

  // $FlowFixMe flow filter bug
  return departures.filter(isUpcomingDeparture).slice(0, maxLength);
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

  return {
    scheduledDeparture,
    predictedDeparture,
    actualDeparture,
    status: await getDepartureStatus()
  };

  async function getDepartureStatus(): Promise<DepartureStatus> {
    if (!predictedDeparture && !actualDeparture) return "unknown";

    const latestAvl = await getLatestAvlFromTripId(scheduledDeparture.tripId);
    if (!latestAvl) return "unknown";

    if (actualDeparture) {
      const currentBusStop = await getBusStopFromAvlId(latestAvl.id);
      return currentBusStop &&
        currentBusStop.id === scheduledDeparture.busStopId
        ? "now"
        : "departed";
    }
    if (predictedDeparture) return "arriving";
    return "unknown";
  }
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
    .query<?AVL>(GET_ACTUAL_DEPARTURE_TODAY_FROM_SCHEDULED_DEPARTURE_ID, [
      scheduledDepartureId
    ])
    .then(results => results.rows[0]);
}

const isUpcomingDeparture = ({
  scheduledDeparture,
  predictedDeparture,
  actualDeparture,
  status
}: Departure) => {
  if (status === "now") return true;

  if (status === "arriving" && predictedDeparture) {
    const cutOffTime = DateTime.local().minus({
      minutes: DEPARTED_BUFFER_LONG
    });
    return (
      DateTime.fromSQL(predictedDeparture.predictedTimestamp).valueOf >
      cutOffTime.valueOf()
    );
  }

  const cutOffTime = DateTime.local().plus({ minutes: DEPARTED_BUFFER_SHORT });
  if (status === "departed" || status == "skipped") {
    return (
      actualDeparture &&
      DateTime.fromSQL(actualDeparture.timestamp).valueOf() >
        cutOffTime.valueOf()
    );
  } else {
    return (
      toActualTime(scheduledDeparture.minuteOfDay).valueOf() >
      cutOffTime.valueOf()
    );
  }
};
