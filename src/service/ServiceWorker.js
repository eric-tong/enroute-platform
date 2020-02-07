// @flow

import { DateTime } from "luxon";
import { insertAllPredictions } from "../resolvers/PredictionResolver";

const TASKS: { task: () => Promise<mixed>, period: number }[] = [
  {
    task: insertAllPredictions,
    period: 30
  }
];

startServiceWorker();

function startServiceWorker() {
  TASKS.forEach(({ task, period }) => {
    task().catch(console.error);
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
