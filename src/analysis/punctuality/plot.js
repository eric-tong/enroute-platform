// @flow

import { getScheduledDepartures } from "./analysis";
import { plot } from "nodeplotlib";

export async function plotTimetable() {
  const { grid, topHeader, leftHeader } = await getScheduledDeparturesGrid();

  const values = [
    leftHeader,
    ...grid.map(row => row.map(cell => (cell ? cell.minuteOfDay : "")))
  ];

  const data = [
    {
      type: "table",
      header: { values: topHeader },
      cells: { values: values },
      columnwidth: [5, Array.from({ length: topHeader.length - 1 }, () => 1)]
    }
  ];
  plot(data);
}

async function getScheduledDeparturesGrid() {
  const scheduledDepartures = await getScheduledDepartures();
  const tripCount = Math.max(
    ...scheduledDepartures.map(departure => departure.tripId)
  );
  const busStopsCount =
    Math.max(...scheduledDepartures.map(departure => departure.busStopId)) + 1;

  const grid = Array.from({ length: tripCount }, () =>
    Array.from({ length: busStopsCount })
  );
  scheduledDepartures.forEach(departure => {
    if (!grid[departure.tripId - 1][departure.busStopId - 1]) {
      grid[departure.tripId - 1][departure.busStopId - 1] = departure;
    } else {
      grid[departure.tripId - 1][busStopsCount - 1] = departure;
    }
  });

  const topHeader = [
    "Trips",
    ...Array.from({ length: tripCount }, (_, i) => i)
  ];
  const leftHeader = Array.from({ length: busStopsCount }, (_, i) => {
    const row = grid.find(trip => !!trip[i]);
    const cell = row && row[i];
    return cell && cell.name;
  });
  return { grid, topHeader, leftHeader };
}
