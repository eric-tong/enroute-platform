// @flow

import { DateTime } from "luxon";
import { vehicleStatusCache } from "./VehicleStatusUpdater";

export function getAllActiveVehicleStatuses(): NonTerminalStatus[] {
  return vehicleStatusCache
    .keys()
    .map<Status>(key => vehicleStatusCache.get(key))
    .filter(status => !status.isInTerminal);
}

export function getAllPredictedBusArrivals(): BusArrival[] {
  return getAllActiveVehicleStatuses()
    .sort((s1, s2) => s2.tripIdConfidence - s1.tripIdConfidence)
    .reduce(
      (array, status) => [...array, ...status.predictedArrivals.slice(0, -1)],
      []
    );
}
