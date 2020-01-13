// @flow

import estimateVehicleStatus from "./vehicleStatusEstimator";
import { getVehicles } from "../resolvers/vehicles";
import { vehicleStatusCache } from "../config";

export default function updateStatus() {
  getVehicles().then(vehicles =>
    vehicles.map(({ id }) =>
      estimateVehicleStatus(id).then(vehicleStatus =>
        vehicleStatusCache.set(id, vehicleStatus)
      )
    )
  );
}
