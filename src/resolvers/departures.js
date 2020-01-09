// @flow

import type { BusStop } from "./busStops";
import { DateTime } from "luxon";
import database from "../database/database";

const GET_DEPARTURE_TIMES_WITH_BUS_STOP_ID = `
SELECT ARRAY_AGG(time) as times FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY trip_id, time DESC) as stops_from_terminal
    FROM departures
) as departures
  WHERE bus_stop_id = $1
  AND stops_from_terminal > 1
`;

const DEPARTURE_BUFFER = 2 * 60 * 1000;

export function getDeparturesFromBusStop(
  busStop: BusStop,
  { maxLength = 5 }: { maxLength: number }
) {
  const now = DateTime.local();
  return database
    .query<{ times: number[] }>(GET_DEPARTURE_TIMES_WITH_BUS_STOP_ID, [
      busStop.id
    ])
    .then(results =>
      results.rows[0].times
        .map<DateTime>(toActualTime)
        .filter(
          dateTime => dateTime.valueOf() + DEPARTURE_BUFFER > now.valueOf()
        )
        .slice(0, maxLength)
        .map<string>(dateTime => dateTime.toISO())
    );
}

function toActualTime(minuteOfDay: number) {
  return DateTime.local()
    .startOf("day")
    .plus({ minute: minuteOfDay });
}
