// @flow

import { captureException, withScope } from "@sentry/node";

import { DateTime } from "luxon";
import { getAllVehicles } from "../resolvers/VehicleResolver";
import { getLatestAvlFromVehicleId } from "../resolvers/AvlResolver";
import { timeDifferenceInSeconds } from "../utils/TimeUtils";

const LATENESS_THRESHOLD = 15 * 60;

export default async function checkTrackers() {
  const vehicles = await getAllVehicles();
  const avls = await Promise.all(
    vehicles.map(vehicle => getLatestAvlFromVehicleId(vehicle.id))
  );
  const now = DateTime.local();

  avls.forEach(avl => {
    const lastTime = DateTime.fromSQL(avl.timestamp);
    if (timeDifferenceInSeconds(now, lastTime) > LATENESS_THRESHOLD) {
      withScope(scope => {
        scope.setLevel("warning");
        scope.setExtra(
          "vehicle",
          vehicles.find(vehicle => vehicle.id === avl.vehicleId)
        );
        scope.setExtra("avl", avl);
        captureException(new Error("Tracker hasn't sent data in a while"));
      });
    }
  });
}
