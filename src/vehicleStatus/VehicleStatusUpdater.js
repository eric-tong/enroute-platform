// @flow

import {
  getBusStopsVisitedByVehicle,
  getCurrentBusStopFromVehicleId
} from "../resolvers/BusStopResolver";

import type { AVL } from "../graphql/AvlSchema";
import { DateTime } from "luxon";
import NodeCache from "node-cache";
import type { Vehicle } from "../graphql/VehicleSchema";
import { getAllVehicles } from "../resolvers/VehicleResolver";
import { getCurrentTripIdFromVehicleId } from "../resolvers/TripResolver";
import { getLatestAvlOfVehicle } from "../resolvers/AvlResolver";

export type NonTerminalStatus = {|
  isInTerminal: false,
  tripId: number,
  tripIdConfidence: number,
  currentBusStopId: ?number,
  busStopsVisited: number[],
  predictedArrivals: BusArrival[],
  avl: AVL
|};
export type Status =
  | {
      isInTerminal: true
    }
  | NonTerminalStatus;

export type BusArrival = {
  tripId: number,
  busStopId: number,
  busStopName: string,
  dateTime: DateTime
};

export const vehicleStatusCache = new NodeCache();

export async function updateVehicleStatus() {
  const vehicles = await getAllVehicles();
  for (const vehicle of vehicles) {
    const status = await estimateVehicleStatus(vehicle);
    vehicleStatusCache.set(vehicle.id, status);
  }
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
    getCurrentBusStopFromVehicleId(vehicle.id, beforeTimestamp),
    getCurrentTripIdFromVehicleId(vehicle.id, beforeTimestamp),
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
