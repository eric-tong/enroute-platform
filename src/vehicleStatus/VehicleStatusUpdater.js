// @flow

import {
  getBusStopFromAvlId,
  getBusStopsVisitedByVehicle
} from "../resolvers/BusStopResolver";

import { DateTime } from "luxon";
import NodeCache from "node-cache";
import { getAllVehicles } from "../resolvers/VehicleResolver";
import { getCurrentTripIdFromVehicleId } from "../resolvers/TripResolver";
import { getLatestAvlOfVehicle } from "../resolvers/AvlResolver";

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
  const avl = await getLatestAvlOfVehicle(vehicle);
  const [
    currentBusStop,
    { tripId, tripIdConfidence },
    busStopsVisited
  ] = await Promise.all([
    getBusStopFromAvlId(avl.id),
    getCurrentTripIdFromVehicleId(vehicle.id, beforeTimestamp),
    getBusStopsVisitedByVehicle(vehicle.id)
  ]);

  return currentBusStop && currentBusStop.isTerminal
    ? { isInTerminal: true }
    : {
        isInTerminal: false,
        tripId,
        tripIdConfidence,
        currentBusStopId: currentBusStop && currentBusStop.id,
        busStopsVisited: busStopsVisited.map(busStop => busStop.id),
        avl,
        predictedArrivals:
          vehicleStatusCache.has(vehicle.id) &&
          vehicleStatusCache.get(vehicle.id).predictedArrivals
            ? vehicleStatusCache.get(vehicle.id).predictedArrivals
            : []
      };
}
