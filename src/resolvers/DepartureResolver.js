// @flow

import {
  getScheduledDeparturesFromBusStopId,
  getScheduledDeparturesFromTripId
} from "./ScheduledDepartureResolver";

import { DateTime } from "luxon";
import { getAllPredictedBusArrivals } from "../vehicleStatus/VehicleStatusGetter";
import { toActualTime } from "../utils/TimeUtils";

const DEPARTURE_BUFFER = 60 * 1000;

export function getDeparturesFromBusStop(
  busStop: BusStop,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength?: number }
) {
  return getScheduledDeparturesFromBusStopId(busStop.id).then(
    scheduledDepartures =>
      scheduledDepartures
        .slice(0, maxLength)
        .map<Departure>(scheduledDeparture => ({
          scheduledDeparture
        }))
  );
}

export async function getDeparturesFromTripId(
  tripId: number,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength?: number }
) {
  return getScheduledDeparturesFromTripId(tripId).then(scheduledDepartures =>
    scheduledDepartures
      .slice(0, maxLength)
      .map<Departure>(scheduledDeparture => ({
        scheduledDeparture
      }))
  );
}
