// @flow

import { DateTime } from "luxon";
import database from "../database/database";

const GET_CURRENT_BUS_STOP = `
WITH latest_avl AS (
  SELECT * FROM avl WHERE vehicle_id = $1 AND timestamp <= $2 ORDER BY timestamp DESC LIMIT 1
)

SELECT bus_stops.id AS "currentBusStopId", bus_stops.is_terminal AS "isInTerminal" FROM latest_avl
  LEFT JOIN bus_stop_visits ON bus_stop_visits.avl_id = latest_avl.id
  LEFT JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
`;
const GET_CURRENT_TRIP = `
WITH last_terminal_exit AS (
  SELECT EXTRACT(minute FROM avl.timestamp) + EXTRACT(hour FROM avl.timestamp) * 60 AS minute_of_day FROM avl
      INNER JOIN bus_stop_visits ON bus_stop_visits.avl_id = avl.id
      INNER JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
      WHERE vehicle_id = $1
      AND avl.timestamp < $2
      AND bus_stops.is_terminal
      ORDER BY timestamp DESC
      LIMIT 1
),
first_stops AS (
  SELECT trip_id, time, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY time) AS stop_number FROM departures
)

SELECT trip_id as "tripId", ABS(last_terminal_exit.minute_of_day - first_stops.time) AS delta FROM first_stops 
  CROSS JOIN last_terminal_exit 
  WHERE stop_number = 1
  ORDER BY delta
  LIMIT 2
`;

type Status =
  | {
      isInTerminal: true
    }
  | {
      isInTerminal: false,
      tripId: number,
      currentBusStopId: ?number,
      confidence: number
    };

export default async function estimateVehicleStatus(
  vehicleId: number,
  beforeTimestamp: string = DateTime.local().toSQL()
) {
  const { currentBusStopId, isInTerminal } = await database
    .query<{ currentBusStopId: ?number, isInTerminal: boolean }>(
      GET_CURRENT_BUS_STOP,
      [vehicleId, beforeTimestamp]
    )
    .then(results => results.rows[0]);
  if (isInTerminal) return { isInTerminal };

  const trips = await database
    .query<{ tripId: number, delta: number }>(GET_CURRENT_TRIP, [
      vehicleId,
      beforeTimestamp
    ])
    .then(results => results.rows);
  const tripId = trips.length > 0 ? trips[0].tripId : 0;
  const confidence =
    trips.length > 1 ? 1 - trips[0].delta / trips[1].delta / 2 : 1;

  return { isInTerminal, tripId, currentBusStopId, confidence };
}
