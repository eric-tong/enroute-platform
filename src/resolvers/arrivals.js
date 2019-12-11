// @flow

import type { BusStop } from "./busStops";
import database from "../database/database";
import moment from "moment";

const GET_ARRIVAL_TIMES_WITH_BUS_STOP_ID = `
SELECT ARRAY_AGG(time) as times
  FROM (SELECT * FROM arrivals WHERE bus_stop_id = $1 ORDER BY time) as arrivals
`;

export function getArrivalsFromBusStop(
  busStop: BusStop,
  { maxLength = 5 }: { maxLength: number }
) {
  const now = moment();
  return database
    .query<{ times: number[] }>(GET_ARRIVAL_TIMES_WITH_BUS_STOP_ID, [
      busStop.id,
    ])
    .then(results =>
      results.rows[0].times
        .map<moment>(toActualTime)
        .filter(moment => moment.isAfter(now))
        .slice(0, maxLength)
        .map<string>(moment => moment.format())
    );
}

function toActualTime(minuteOfDay: number) {
  return moment()
    .startOf("day")
    .add(minuteOfDay, "minute");
}
