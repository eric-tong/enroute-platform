// @flow

import {
  getBusStopsVisitedByVehicle,
  getCurrentBusStopOfVehicle
} from "../resolvers/busStops";

import type { AVL } from "../resolvers/avl";
import type { BusStopsArrival } from "./busArrivalPredictor";
import { DateTime } from "luxon";
import NodeCache from "node-cache";
import type { Vehicle } from "../resolvers/vehicles";
import { getCurrentTripIdOfVehicle } from "../resolvers/trips";
import { getLatestAvlOfVehicle } from "../resolvers/avl";
import { getVehicles } from "../resolvers/vehicles";

export type Status =
  | {
      isInTerminal: true
    }
  | {
      isInTerminal: false,
      tripId: number,
      tripIdConfidence: number,
      currentBusStopId: ?number,
      busStopsVisited: number[],
      predictedArrivals: BusStopsArrival[],
      avl: AVL
    };

export const vehicleStatusCache = new NodeCache();

export async function updateVehicleStatus() {
  const vehicles = await getVehicles();
  for (const vehicle of vehicles) {
    const status = await estimateVehicleStatus(vehicle);
    vehicleStatusCache.set(vehicle.id, status);
    console.log(vehicle.id, status);
  }
}

export function getAllVehicleStatuses(): Status[] {
  return vehicleStatusCache
    .keys()
    .map<Status>(key => vehicleStatusCache.get(key));
}

async function estimateVehicleStatus(
  vehicle: Vehicle,
  beforeTimestamp: string = DateTime.local().toSQL()
): Promise<Status> {
  const [
    { currentBusStopId, isInTerminal },
    { tripId, tripIdConfidence },
    busStopsVisited,
    avl
  ] = await Promise.all([
    getCurrentBusStopOfVehicle(vehicle.id, beforeTimestamp),
    getCurrentTripIdOfVehicle(vehicle.id, beforeTimestamp),
    getBusStopsVisitedByVehicle(vehicle.id, beforeTimestamp),
    getLatestAvlOfVehicle(vehicle)
  ]);

  return isInTerminal
    ? { isInTerminal: true }
    : {
        isInTerminal: false,
        tripId,
        tripIdConfidence,
        currentBusStopId,
        busStopsVisited,
        avl,
        predictedArrivals:
          vehicleStatusCache.has(vehicle.id) &&
          vehicleStatusCache.get(vehicle.id).predictedArrivals
            ? vehicleStatusCache.get(vehicle.id).predictedArrivals
            : []
      };
}
