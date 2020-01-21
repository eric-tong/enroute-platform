// @flow

import {
  getBusStopsVisitedByVehicle,
  getCurrentBusStopOfVehicle
} from "../resolvers/BusStopResolver";

import type { AVL } from "../graphql/AvlSchema";
import type { BusStopsArrival } from "./busArrivalPredictor";
import { DateTime } from "luxon";
import NodeCache from "node-cache";
import type { Vehicle } from "../graphql/VehicleSchema";
import { getAllVehicles } from "../resolvers/VehicleResolver";
import { getCurrentTripIdOfVehicle } from "../resolvers/TripResolver";
import { getLatestAvlOfVehicle } from "../resolvers/AvlResolver";

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
  const vehicles = await getAllVehicles();
  for (const vehicle of vehicles) {
    const status = await estimateVehicleStatus(vehicle);
    vehicleStatusCache.set(vehicle.id, status);
    if (!status.isInTerminal) console.log(vehicle.id, status);
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
