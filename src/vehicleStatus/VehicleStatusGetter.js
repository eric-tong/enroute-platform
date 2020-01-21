// @flow

import type { Status } from "./VehicleStatusUpdater";
import { vehicleStatusCache } from "./VehicleStatusUpdater";

export function getAllVehicleStatuses(): Status[] {
  return vehicleStatusCache
    .keys()
    .map<Status>(key => vehicleStatusCache.get(key));
}
