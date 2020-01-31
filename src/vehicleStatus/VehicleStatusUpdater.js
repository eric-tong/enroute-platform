// @flow

import {
  getBusStopFromAvlId,
  getBusStopsVisitedByVehicle
} from "../resolvers/BusStopResolver";

import { DateTime } from "luxon";
import NodeCache from "node-cache";
import { getAllVehicles } from "../resolvers/VehicleResolver";
import { getLatestAvlFromVehicleId } from "../resolvers/AvlResolver";
import { getTripIdFromVehicleId } from "../resolvers/TripResolver";

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
  const avl = await getLatestAvlFromVehicleId(vehicle.id);
  if (!avl) return { isInTerminal: true };
  const [currentBusStop, tripId, busStopsVisited] = await Promise.all([
    getBusStopFromAvlId(avl.id),
    getTripIdFromVehicleId(vehicle.id),
    getBusStopsVisitedByVehicle(vehicle.id)
  ]);

  return currentBusStop && currentBusStop.isTerminal
    ? { isInTerminal: true }
    : {
        isInTerminal: false,
        tripId,
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
