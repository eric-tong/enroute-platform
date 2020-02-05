// @flow

import { DateTime } from "luxon";
import { updateBusArrivalPredictions } from "../vehicleStatus/BusArrivalPredictor";
import { updateVehicleStatus } from "../vehicleStatus/VehicleStatusUpdater";

const TASKS = [
  {
    task: updateVehicleStatus,
    period: 15
  },
  {
    task: updateBusArrivalPredictions,
    period: 30
  }
];

startServiceWorker();

function startServiceWorker() {
  TASKS.forEach(({ task, period }) => {
    task();
    setIntervalWithCheck(task, period);
  });
  startInitialTasks();
}

function setIntervalWithCheck(task: () => mixed, periodInSeconds) {
  return setInterval(() => {
    if (shouldRunTasks) task();
  }, periodInSeconds * 1000);
}

async function startInitialTasks() {
  for (const { task } of TASKS) {
    await task();
  }
}

function shouldRunTasks() {
  const now = DateTime.local();
  return now.weekday <= 5 && now.hour > 7 && now.hour < 20;
}
