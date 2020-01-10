// @flow

import type { AVLData } from "../trackers/codec8Schema";
import database from "../database/database";
import { getBusStops } from "../resolvers/busStops";

const GET_BUS_STOPS_IN_RANGE = `
WITH final_avl AS (
  SELECT timestamp, vehicle_id FROM avl WHERE id = 78959	
),
avls AS (
  SELECT id, longitude, latitude FROM avl 
    WHERE timestamp <= (SELECT timestamp FROM final_avl)
    AND satellites > 3
    AND vehicle_id = (SELECT vehicle_id FROM final_avl)
    ORDER BY timestamp DESC
    LIMIT 2
)

SELECT bus_stops.id AS bus_stop_id, avls.id AS avl_id, point(bus_stops.longitude, bus_stops.latitude) <-> point(avls.longitude, avls.latitude) AS distance
  FROM bus_stops CROSS JOIN avls
`;

export async function checkStateTransition(avlId: number) {
  const avls = await database
    .query(GET_BUS_STOPS_IN_RANGE, [avlId])
    .then(results => results.rows[0]);
  const busStops = await getBusStops();

  return avls;
}
