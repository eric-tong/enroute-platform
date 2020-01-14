// @flow

import { DateTime } from "luxon";
import { updateBusArrivalPredictions } from "../predictor/busArrivalPredictor";
import { updateVehicleStatus } from "../predictor/vehicleStatus";

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
}

function setIntervalWithCheck(task: () => mixed, periodInSeconds) {
  return setInterval(() => {
    if (shouldRunTasks) task();
  }, periodInSeconds * 1000);
}

function shouldRunTasks() {
  const now = DateTime.local();
  return now.weekday <= 5 && now.hour > 7 && now.hour < 20;
}
