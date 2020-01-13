import { DateTime } from "luxon";
import { updateVehicleStatus } from "../predictor/vehicleStatus";

// @flow

const PERIOD = 15 * 1000;
const BACKGROUND_TASKS = [updateVehicleStatus];

startServiceWorker();

function startServiceWorker() {
  setInterval(runBackgroundTasks, PERIOD);
}

function runBackgroundTasks() {
  if (shouldRunTasks()) BACKGROUND_TASKS.forEach(task => task());
}

function shouldRunTasks() {
  const now = DateTime.local();
  return now.weekday <= 5 && now.hour > 7 && now.hour < 20;
}
