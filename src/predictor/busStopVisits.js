import database from "../database/database";

// @flow

const GEOFENCE_RADIUS = 0.001;
const SAVE_BUS_STOP_VISIT_FROM_AVL_ID = `
WITH avl AS (
    SELECT id, longitude, latitude, angle FROM avl WHERE id = $1
)

INSERT INTO bus_stop_visits
SELECT avl.id as avl_id, bus_stops.id as bus_stop_id
    FROM bus_stops CROSS JOIN avl
    WHERE CIRCLE(POINT(bus_stops.longitude, bus_stops.latitude), ${GEOFENCE_RADIUS}) @> POINT(avl.longitude, avl.latitude)
    AND (
        bus_stops.road_angle = NULL
        OR ABS(bus_stops.road_angle - avl.angle) < 45
        OR ABS(bus_stops.road_angle - avl.angle) > 315
    )
    RETURNING *
`;
const GET_AVL_ID_IN_DATE =
  "SELECT id FROM avl WHERE DATE(timestamp) = DATE($1) ORDER BY timestamp DESC";

export function saveBusStopVisits(avlId: number) {
  return database
    .query(SAVE_BUS_STOP_VISIT_FROM_AVL_ID, [avlId])
    .then(result => result.rows)
    .then(rows => rows.length && console.log(rows))
    .catch(console.log);
}

export function checkVisitsInDate(date: string = DateTime.local().toSQL()) {
  return database
    .query(GET_AVL_ID_IN_DATE, [date])
    .then(results => results.rows.map(avl => avl.id))
    .then(avlIds => avlIds.forEach(saveBusStopVisits))
    .catch(console.log);
}
