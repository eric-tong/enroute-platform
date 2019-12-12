// @flow

import type { BusStop } from "./busStops";
import { DateTime } from "luxon";
import database from "../database/database";

const GET_ARRIVAL_TIMES_WITH_BUS_STOP_ID = `
SELECT ARRAY_AGG(time) as times
  FROM (SELECT * FROM arrivals WHERE bus_stop_id = $1 ORDER BY time) as arrivals
`;

export function getArrivalsFromBusStop(
  busStop: BusStop,
  { maxLength = 5 }: { maxLength: number }
) {
  const now = DateTime.local();
  return database
    .query<{ times: number[] }>(GET_ARRIVAL_TIMES_WITH_BUS_STOP_ID, [
      busStop.id,
    ])
    .then(results =>
      results.rows[0].times
        .map<DateTime>(toActualTime)
        .filter(dateTime => dateTime.valueOf() > now.valueOf())
        .slice(0, maxLength)
        .map<string>(dateTime => dateTime.toISO())
    );
}

function toActualTime(minuteOfDay: number) {
  return DateTime.local()
    .startOf("day")
    .plus({ minute: minuteOfDay });
}
