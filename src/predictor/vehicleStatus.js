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
      busStopsVisited: number[],
      predictedArrivals: BusStopsArrival[],
      avl: AVL
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
        confidence,
        currentBusStopId,
        busStopsVisited,
        avl,
        predictedArrivals: await getBusArrivalPredictions(
          tripId,
          busStopsVisited,
          {
            longitude: avl.latitude,
            latitude: avl.longitude,
            roadAngle: avl.angle,
            name: `Vehicle ${avl.vehicleId}`,
            street: "",
            icon: "",
            id: 0
          }
        )
      };
}
