// @flow

import estimateVehicleStatus from "./vehicleStatusEstimator";
import { getVehicles } from "../resolvers/vehicles";

export default function updateStatus() {
  getVehicles().then(vehicles =>
    vehicles.map(({ id }) => estimateVehicleStatus(id).then(console.log))
  );
}
