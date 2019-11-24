// @flow

import type { BusStop } from "./busStops";
import database from "./database";

const GET_ARRIVAL_TIMES_WITH_BUS_STOP_ID = `
SELECT ARRAY_AGG(time) as times
  FROM (SELECT * FROM arrivals WHERE busStopId = $1 ORDER BY time) as arrivals
`;

export function getArrivalsFromBusStop(busStop: BusStop) {
  return database
    .query<{| times: number[] |}>(GET_ARRIVAL_TIMES_WITH_BUS_STOP_ID, [
      busStop.id,
    ])
    .then(results => results.rows[0].times);
}
