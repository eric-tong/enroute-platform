// @flow

import {
  getBusStopsVisitedByVehicle,
  getCurrentBusStopOfVehicle
} from "../resolvers/busStops";

import { DateTime } from "luxon";
import NodeCache from "node-cache";
import { getCurrentTripIdOfVehicle } from "../resolvers/trips";
import { getVehicles } from "../resolvers/vehicles";

type Status =
  | {
      isInTerminal: true
    }
  | {
      isInTerminal: false,
      tripId: number,
      confidence: number,
      currentBusStopId: ?number,
      busStopsVisited: number[]
    };

export const vehicleStatusCache = new NodeCache();

export function updateVehicleStatus() {
  getVehicles().then(vehicles =>
    vehicles.map(({ id }) =>
      estimateVehicleStatus(id).then(
        vehicleStatus =>
          console.log(id, vehicleStatus) ||
          vehicleStatusCache.set(id, vehicleStatus)
      )
    )
  );
}

async function estimateVehicleStatus(
  vehicleId: number,
  beforeTimestamp: string = DateTime.local().toSQL()
): Promise<Status> {
  const [
    { currentBusStopId, isInTerminal },
    { tripId, confidence },
    busStopsVisited
  ] = await Promise.all([
    getCurrentBusStopOfVehicle(vehicleId, beforeTimestamp),
    getCurrentTripIdOfVehicle(vehicleId, beforeTimestamp),
    getBusStopsVisitedByVehicle(vehicleId, beforeTimestamp)
  ]);

  return isInTerminal
    ? { isInTerminal: true }
    : {
        isInTerminal: false,
        tripId,
        confidence,
        currentBusStopId,
        busStopsVisited
      };
}
