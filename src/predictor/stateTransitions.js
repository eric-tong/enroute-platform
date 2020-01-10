// @flow

import type { AVLData } from "../trackers/codec8Schema";
import database from "../database/database";
import { getBusStops } from "../resolvers/busStops";

const GEOFENCE_RADIUS = 0.001;
const GET_NEARBY_BUS_STOPS = `
WITH final_avl AS (
  SELECT timestamp, vehicle_id FROM avl WHERE id = $1
),
avls AS (
  SELECT id, longitude, latitude FROM avl 
    WHERE timestamp <= (SELECT timestamp FROM final_avl)
    AND satellites > 3
    AND vehicle_id = (SELECT vehicle_id FROM final_avl)
    ORDER BY timestamp DESC
    LIMIT 2
),
nearby_bus_stops AS (
  SELECT avls.id AS avl_id,
  MAX(CASE WHEN CIRCLE(POINT(bus_stops.longitude, bus_stops.latitude), 0.001) @> POINT(avls.longitude, avls.latitude) 
    THEN bus_stops.id ELSE 0 END) AS bus_stop_id
    FROM bus_stops CROSS JOIN avls
    GROUP BY avl_id
)

SELECT avl.id AS "avlId", avl.timestamp, POINT(avl.longitude, avl.latitude) as "avlCoords",
       bus_stops.id AS "busStopId", POINT(bus_stops.longitude, bus_stops.latitude) as "busStopCoords"
  FROM nearby_bus_stops
  LEFT JOIN avl ON nearby_bus_stops.avl_id = avl.id
  LEFT JOIN bus_stops ON nearby_bus_stops.bus_stop_id = bus_stops.id;
`;

export async function checkStateTransition(avlId: number) {
  const avlToNearbyBusStop = await database
    .query(GET_NEARBY_BUS_STOPS, [avlId])
    .then(results => results.rows[0]);

  return avlToNearbyBusStop;
}
