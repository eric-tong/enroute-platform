// @flow

import database from "../../database/database";

export async function getRawData() {
  const GET_RAW_DATA = `
  SELECT  bus_stops.id AS "busStopId", 
          bus_stops.name,
          vehicle_id AS vehicle,
          scheduled_departures.trip_id AS trip,
          scheduled_departure_id AS "scheduledId",
          MIN(avl.timestamp)::DATE + MAKE_INTERVAL(mins => scheduled_departures.minute_of_day) AS scheduled,
          MIN(avl.timestamp) as enter, 
          MAX(avl.timestamp) as exit, 
          is_proxy AS skipped

    FROM avl
    INNER JOIN bus_stop_visits ON bus_stop_visits.avl_id = avl.id
    INNER JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
    LEFT JOIN scheduled_departures ON scheduled_departures.id = bus_stop_visits.scheduled_departure_id
    WHERE NOW()::DATE - timestamp::DATE < 14
    GROUP BY avl.timestamp::DATE, vehicle_id, scheduled_departure_id, bus_stops.name, bus_stops.id, is_proxy, scheduled_departures.minute_of_day, trip_id
    ORDER BY MIN(avl.timestamp)::DATE, vehicle_id
  `;

  return await database.query<any>(GET_RAW_DATA).then(results => results.rows);
}
