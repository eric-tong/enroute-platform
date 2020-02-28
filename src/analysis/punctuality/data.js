// @flow

import database from "../../database/database";

export async function createTempTable() {
  const CREATE_TEMP_TABLE = `
  CREATE TEMPORARY TABLE visits_temp AS

  WITH bus_stop_visits AS (
  SELECT  bus_stop_visits.*,
          ROW_NUMBER() OVER (ORDER BY vehicle_id, timestamp)
          - ROW_NUMBER() OVER (PARTITION BY bus_stop_id ORDER BY vehicle_id, timestamp) AS group
    FROM bus_stop_visits
    INNER JOIN avl ON avl.id = bus_stop_visits.avl_id
    WHERE NOW()::DATE - timestamp::DATE < 14
    ORDER BY ROW_NUMBER() OVER (ORDER BY vehicle_id, timestamp)
    - ROW_NUMBER() OVER (PARTITION BY bus_stop_id ORDER BY vehicle_id, timestamp)
  )

  SELECT  bus_stops.id AS bus_stop_id, 
          bus_stops.name,
          bus_stops.is_terminal,
          vehicle_id,
          scheduled_departures.trip_id,
          scheduled_departure_id,
          MIN(avl.timestamp)::DATE + MAKE_INTERVAL(mins => scheduled_departures.minute_of_day) AS scheduled,
          MIN(avl.timestamp)::TIMESTAMP as enter, 
          MAX(avl.timestamp)::TIMESTAMP as exit,
          MAX(avl.timestamp)::TIMESTAMP - MIN(avl.timestamp)::DATE - MAKE_INTERVAL(mins => scheduled_departures.minute_of_day) AS delta,
          is_proxy AS skipped

    FROM avl
    INNER JOIN bus_stop_visits ON bus_stop_visits.avl_id = avl.id
    INNER JOIN bus_stops ON bus_stops.id = bus_stop_visits.bus_stop_id
    LEFT JOIN scheduled_departures ON scheduled_departures.id = bus_stop_visits.scheduled_departure_id
    WHERE NOW()::DATE - timestamp::DATE < 14
    AND EXTRACT(dow FROM timestamp) BETWEEN 1 AND 5
    GROUP BY bus_stop_visits.group, avl.timestamp::DATE, vehicle_id, scheduled_departure_id, bus_stops.name, bus_stops.id, is_proxy, scheduled_departures.minute_of_day, trip_id
    ORDER BY MIN(avl.timestamp)::DATE, vehicle_id, MIN(avl.timestamp)
  `;

  return await database
    .query<any>(CREATE_TEMP_TABLE)
    .then(results => results.rows);
}

export async function getDelta() {
  const GET_DELTA = `
    SELECT name, delta 
      FROM visits_temp 
      WHERE delta IS NOT NULL
      ORDER BY delta DESC
  `;
}

export async function getMedianDelta() {
  const GET_DELTA = `
    SELECT name, median(extract(epoch from delta)::NUMERIC)
      FROM visits_temp 
      WHERE delta IS NOT NULL
      GROUP BY bus_stop_id, name
      ORDER BY median(extract(epoch from delta)::NUMERIC) DESC
  `;
}
