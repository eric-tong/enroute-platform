// @flow

import NodeCache from "node-cache";
import estimateVehicleStatus from "./vehicleStatusEstimator";
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
