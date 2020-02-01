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
      scheduledDepartures.map<Departure>(scheduledDeparture => ({
        scheduledDeparture
      }))
  );
}

export async function getDeparturesFromTripId(
  tripId: number,
  { maxLength = Number.MAX_SAFE_INTEGER }: { maxLength: number }
) {
  const predictedDepartures = getAllPredictedBusArrivals();
  const scheduledDepartures = await getScheduledDeparturesFromTripId(tripId);

  return getRelevantDepartures(
    predictedDepartures,
    scheduledDepartures,
    maxLength,
    false
  );
}

function getRelevantDepartures(
  predictedDepartures: BusArrival[],
  scheduledDepartures: ScheduledDeparture[],
  maxLength: number,
  upcomingOnly: boolean = true
) {
  const now = DateTime.local();
  const relevantDepartures: Departure[] = [];
  for (const scheduledDeparture of scheduledDepartures) {
    if (relevantDepartures.length >= maxLength) break;
    const scheduledTime = toActualTime(scheduledDeparture.minuteOfDay);
    const predictedArrival = predictedDepartures.find(
      predictedDeparture =>
        predictedDeparture.tripId === scheduledDeparture.tripId &&
        predictedDeparture.busStopId === scheduledDeparture.busStopId
    );
    if (
      predictedArrival ||
      !upcomingOnly ||
      scheduledTime.valueOf() + DEPARTURE_BUFFER >= now.valueOf()
    ) {
      relevantDepartures.push({
        scheduled: scheduledTime.toSQL(),
        predicted: (predictedArrival
          ? predictedArrival.dateTime
          : scheduledTime
        ).toSQL(),
        tripId: scheduledDeparture.tripId,
        busStopId: scheduledDeparture.busStopId
      });
    }
  }

  return relevantDepartures;
}
