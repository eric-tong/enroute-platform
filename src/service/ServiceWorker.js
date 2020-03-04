// @flow

import { DateTime } from "luxon";
import checkTrackers from "../trackers/CheckTrackers";
import { insertAllPredictions } from "../resolvers/PredictionResolver";
import { updateDeparturesCache } from "./DeparturesCache";

const TASKS: { task: () => Promise<mixed>, period: number }[] = [
  {
    task: insertAllPredictions,
    period: 30
  },
  {
    task: updateDeparturesCache,
    period: 15
  },
  {
    task: checkTrackers,
    period: 30 * 60
  }
];

startServiceWorker();

function startServiceWorker() {
  TASKS.forEach(({ task, period }) => {
    setIntervalWithCheck(task, period);
  });
  startInitialTasks();
}

function setIntervalWithCheck(task, periodInSeconds) {
  return setInterval(() => {
    if (shouldRunTasks) task().catch(console.error);
  }, periodInSeconds * 1000);
}

async function startInitialTasks() {
  for (const { task } of TASKS) {
    await task().catch(console.error);
  }
}

function shouldRunTasks() {
  const now = DateTime.local();
  return now.weekday <= 5 && now.hour > 7 && now.hour < 20;
}
