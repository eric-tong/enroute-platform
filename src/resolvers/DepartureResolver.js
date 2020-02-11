// @flow

import {
  AVL_COLUMNS,
  getAvlFromAvlId,
  getAvlOfLastTerminalExitFromVehicleId,
  getLatestAvlFromVehicleId,
  getLatestAvlTodayFromTripId
} from "./AvlResolver";
import {
  getScheduledDeparturesExceptLastInTripFromBusStopId,
  getScheduledDeparturesFromTripId
} from "./ScheduledDepartureResolver";
import { timeDifferenceInSeconds, toActualTime } from "../utils/TimeUtils";

import { DateTime } from "luxon";
import database from "../database/database";
import { getBusStopFromAvlId } from "./BusStopResolver";
import { getPredictedDepartureTodayFromScheduledDepartureId } from "./PredictedDepartureResolver";
import { tripIsStarted } from "./TripResolver";

const DEPARTED_BUFFER_SHORT = 2.5;
const DEPARTED_BUFFER_LONG = 10;

export async function getUpcomingDeparturesFromBusStop(
  busStop: BusStop,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength?: number }
) {
  const departures = await (!busStop.isTerminal
    ? getAllDeparturesFromBusStopId(busStop.id)
    : await getScheduledDeparturesExceptLastInTripFromBusStopId(
        busStop.id
      ).then(scheduledDepartures =>
        Promise.all(
          scheduledDepartures.map(getTerminalDepartureFromScheduledDeparture)
        )
      ));

  // $FlowFixMe flow filter bug
  return departures.filter(isUpcomingDeparture).slice(0, maxLength);
}

async function getTerminalDepartureFromScheduledDeparture(
  scheduledDeparture: ScheduledDeparture
): Promise<Departure> {
  const scheduledDepartureTime = toActualTime(scheduledDeparture.minuteOfDay);
  if (await tripIsStarted(scheduledDeparture.tripId)) {
    return {
      scheduledDeparture,
      predictedDeparture: undefined,
      actualDeparture: await getLatestAvlTodayFromTripId(
        scheduledDeparture.tripId
      )
        .then(latestAvl =>
          latestAvl
            ? getAvlOfLastTerminalExitFromVehicleId(latestAvl.vehicleId)
            : { timestamp: scheduledDepartureTime.toSQL() }
        )
        .catch(console.error),
      status: "departed"
    };
  } else if (
    Math.abs(timeDifferenceInSeconds(scheduledDepartureTime)) <
    DEPARTED_BUFFER_SHORT * 60
  ) {
    return {
      scheduledDeparture,
      predictedDeparture: undefined,
      actualDeparture: undefined,
      status: "now"
    };
  } else {
    return {
      scheduledDeparture,
      predictedDeparture: undefined,
      actualDeparture: undefined,
      status: "unknown"
    };
  }
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
  const scheduledDepartures: ScheduledDeparture[] = await getScheduledDeparturesFromTripId(
    tripId
  );

  const allDeparturesFromTrip = await Promise.all(
    scheduledDepartures.map(getDepartureFromScheduledDeparture)
  );

  // If trip has started, set first departure from terminal to be departed
  // and actual departure to be last avl exit from terminal
  if ((await tripIsStarted(tripId)) && allDeparturesFromTrip.length > 0) {
    const lastTerminalDeparture = await getLatestAvlTodayFromTripId(tripId)
      .then(avl =>
        avl ? getAvlOfLastTerminalExitFromVehicleId(avl.vehicleId) : undefined
      )
      .catch(console.error);
    allDeparturesFromTrip[0].status = "departed";
    allDeparturesFromTrip[0].actualDeparture = lastTerminalDeparture
      ? lastTerminalDeparture
      : {
          timestamp: toActualTime(
            allDeparturesFromTrip[0].scheduledDeparture.minuteOfDay
          ).toSQL()
        };
  }

  return allDeparturesFromTrip;
}

export async function getDepartureFromScheduledDeparture(
  scheduledDeparture: ScheduledDeparture
): Promise<Departure> {
  const [predictedDeparture, { isProxy, actualDeparture }] = await Promise.all([
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
    if (isProxy) return "skipped";
    if (!predictedDeparture && !actualDeparture) return "unknown";

    const latestAvl = await getLatestAvlTodayFromTripId(
      scheduledDeparture.tripId
    );
    if (!latestAvl) return "unknown";

    if (actualDeparture) {
      const currentBusStop = await getBusStopFromAvlId(latestAvl.id);
      return currentBusStop &&
        currentBusStop.id === scheduledDeparture.busStopId &&
        !currentBusStop.isTerminal
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
    SELECT ${AVL_COLUMNS}, bus_stop_visits.is_proxy AS "isProxy" FROM bus_stop_visits
      INNER JOIN avl ON avl.id = bus_stop_visits.avl_id
      WHERE bus_stop_visits.scheduled_departure_id = $1
      AND avl.timestamp::DATE = now()::DATE
      ORDER BY avl.timestamp DESC
      LIMIT 1
  `;
  return database
    .query<?{| ...AVL, isProxy: boolean |}>(
      GET_ACTUAL_DEPARTURE_TODAY_FROM_SCHEDULED_DEPARTURE_ID,
      [scheduledDepartureId]
    )
    .then(results => {
      const row = results.rows[0];
      if (!row) return { isProxy: false, actualDeparture: null };

      const { isProxy, ...actualDeparture } = row;
      return { isProxy, actualDeparture };
    });
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
      DateTime.fromSQL(predictedDeparture.predictedTimestamp).valueOf() >
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
