// @flow

import {
  getBusStopFromAvlId,
  getBusStopsVisitedTodayFromTripId
} from "../resolvers/BusStopResolver";
import {
  getTripIdFromAvlId,
  getTripIdFromVehicleId
} from "../resolvers/TripResolver";

import { DateTime } from "luxon";
import NodeCache from "node-cache";
import { getAllVehicles } from "../resolvers/VehicleResolver";
import { getLatestAvlFromVehicleId } from "../resolvers/AvlResolver";

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

  const tripId: ?number = await getTripIdFromAvlId(avl.id);
  if (!tripId) return { isInTerminal: true };

  const busStopsVisited = await getBusStopsVisitedTodayFromTripId(tripId);
  const currentBusStop = await getBusStopFromAvlId(avl.id);

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
