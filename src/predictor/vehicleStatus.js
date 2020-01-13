// @flow

import {
  getBusStopsVisitedByVehicle,
  getCurrentBusStopOfVehicle
} from "../resolvers/busStops";

import type { BusStopsArrival } from "./busArrivalPredictor";
import { DateTime } from "luxon";
import NodeCache from "node-cache";
import type { Vehicle } from "../resolvers/vehicles";
import { getBusArrivalPredictions } from "./busArrivalPredictor";
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
      confidence: number,
      currentBusStopId: ?number,
      coords: { longitude: number, latitude: number },
      busStopsVisited: number[],
      predictedArrivals: BusStopsArrival[]
    };

export const vehicleStatusCache = new NodeCache();

export function updateVehicleStatus() {
  getVehicles().then(vehicles =>
    vehicles.map(vehicle =>
      estimateVehicleStatus(vehicle).then(
        vehicleStatus =>
          console.log(vehicle.id, vehicleStatus) ||
          vehicleStatusCache.set(vehicle.id, vehicleStatus)
      )
    )
  );
}

async function estimateVehicleStatus(
  vehicle: Vehicle,
  beforeTimestamp: string = DateTime.local().toSQL()
): Promise<Status> {
  const [
    { currentBusStopId, isInTerminal },
    { tripId, confidence },
    { longitude, latitude },
    busStopsVisited
  ] = await Promise.all([
    getCurrentBusStopOfVehicle(vehicle.id, beforeTimestamp),
    getCurrentTripIdOfVehicle(vehicle.id, beforeTimestamp),
    getLatestAvlOfVehicle(vehicle),
    getBusStopsVisitedByVehicle(vehicle.id, beforeTimestamp)
  ]);

  const predictedArrivals = await getBusArrivalPredictions(
    tripId,
    busStopsVisited,
    {
      longitude,
      latitude
    }
  );

  return isInTerminal
    ? { isInTerminal: true }
    : {
        isInTerminal: false,
        tripId,
        confidence,
        currentBusStopId,
        coords: { longitude, latitude },
        busStopsVisited,
        predictedArrivals
      };
}
