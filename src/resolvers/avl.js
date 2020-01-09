// @flow

import { DateTime } from "luxon";
import type { Vehicle } from "./vehicles";
import database from "../database/database";

export type AVL = {|
  id: number,
  timestamp: DateTime,
  longitude: number,
  latitude: number,
  angle: number,
  speed: number
|};

const GET_FULL_AVLS_WITH_DATE = `SELECT *, vehicle_id as "vehicleId" FROM avl WHERE timestamp::DATE = $1::DATE`;
const GET_COMPRESSED_AVLS_WITH_DATE = `
WITH _avls_by_position AS (
  SELECT
    *,
    row_number() OVER (PARTITION BY latitude, longitude ORDER BY timestamp) AS row_number_position
  FROM avl
  WHERE timestamp::DATE = $1::DATE
),
_avls_by_minute AS (
  SELECT
    *,
    row_number() OVER (PARTITION BY DATE_TRUNC('minute', timestamp) ORDER BY timestamp) AS row_number_minute
  FROM _avls_by_position
  WHERE row_number_position = 1
)

SELECT * FROM _avls_by_minute WHERE row_number_minute = 1;
`;

const GET_AVL_OF_VEHICLE = `SELECT * FROM avl WHERE vehicle_id = $1 AND satellites > 3 ORDER BY timestamp DESC LIMIT 1`;

export function getAvl(
  _: void,
  {
    date = DateTime.local().toSQL(),
    full = false
  }: { date: ?string, full: ?boolean }
) {
  return database
    .query<AVL>(
      full ? GET_FULL_AVLS_WITH_DATE : GET_COMPRESSED_AVLS_WITH_DATE,
      [date]
    )
    .then(results => results.rows);
}

export function getLatestAvlOfVehicle(vehicle: Vehicle) {
  return database
    .query<AVL>(GET_AVL_OF_VEHICLE, [vehicle.id])
    .then(results => results.rows[0]);
}
