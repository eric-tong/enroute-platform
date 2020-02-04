// @flow

import { getAvlFromAvlId, getLatestAvlFromVehicleId } from "./AvlResolver";
import {
  getScheduledDeparturesExceptLastInTripFromBusStopId,
  getScheduledDeparturesFromTripId
} from "./ScheduledDepartureResolver";

import { BUS_STOP_VISIT_COLUMNS } from "./BusStopVisitResolver";
import { DateTime } from "luxon";
import database from "../database/database";
import { getAllPredictedBusArrivals } from "../vehicleStatus/VehicleStatusGetter";
import { getPredictedDepartureTodayFromScheduledDepartureId } from "./PredictedDepartureResolver";
import { toActualTime } from "../utils/TimeUtils";

const DEPARTURE_BUFFER = 60 * 1000;

export async function getAllDeparturesFromBusStop(
  busStop: BusStop,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength?: number }
) {
  return getScheduledDeparturesExceptLastInTripFromBusStopId(busStop.id).then(
    getDeparturesFromScheduledDepartures
  );
}

export async function getAllDeparturesFromTripId(
  tripId: number,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength?: number }
) {
  return getScheduledDeparturesFromTripId(tripId).then(
    getDeparturesFromScheduledDepartures
  );
}

export async function getDeparturesFromScheduledDepartures(
  scheduledDepartures: ScheduledDeparture[]
) {
  const getPredictedDepartures = Promise.all(
    scheduledDepartures.map(scheduledDeparture =>
      getPredictedDepartureTodayFromScheduledDepartureId(scheduledDeparture.id)
    )
  );
  const getActualDepartures = Promise.all(
    scheduledDepartures.map(scheduledDeparture =>
      getActualDepartureTodayFromScheduledDepartureId(scheduledDeparture.id)
    )
  );
  const [predictedDepartures, actualDepartures] = await Promise.all([
    getPredictedDepartures,
    getActualDepartures
  ]);
  const isAtBusStopArray = await Promise.all(
    actualDepartures.map(actualDeparture => {
      if (!actualDeparture) return false;
      else
        return getAvlFromAvlId(actualDeparture.avlId)
          .then(avl => getLatestAvlFromVehicleId(avl.vehicleId))
          .then(latestAvl => latestAvl.id === actualDeparture.avlId);
    })
  );

  return scheduledDepartures.map<Departure>((scheduledDeparture, i) => ({
    scheduledDeparture,
    predictedDeparture: predictedDepartures[i],
    actualDeparture: actualDepartures[i],
    isAtBusStop: isAtBusStopArray[i]
  }));
}

function getActualDepartureTodayFromScheduledDepartureId(
  scheduledDepartureId: number
) {
  const GET_ACTUAL_DEPARTURE_TODAY_FROM_SCHEDULED_DEPARTURE_ID = `
    SELECT ${BUS_STOP_VISIT_COLUMNS} FROM bus_stop_visits
      INNER JOIN avl ON avl.id = bus_stop_visits.avl_id
      WHERE scheduled_departure_id = $1
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
