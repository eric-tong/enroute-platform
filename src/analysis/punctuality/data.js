// @flow

import database from "../../database/database";

export async function createTempTable() {
  const CREATE_TEMP_TABLE = `
  CREATE TABLE IF NOT EXISTS visits_temp AS

  WITH bus_stop_visits AS (
  SELECT  bus_stop_visits.*,
          ROW_NUMBER() OVER (ORDER BY timestamp::DATE, vehicle_id, timestamp)
          - ROW_NUMBER() OVER (PARTITION BY bus_stop_id ORDER BY timestamp::DATE, vehicle_id, timestamp) AS group
    FROM bus_stop_visits
    INNER JOIN avl ON avl.id = bus_stop_visits.avl_id
    WHERE NOW()::DATE - timestamp::DATE < 14
  )

  SELECT  ROW_NUMBER() OVER (ORDER BY MIN(avl.timestamp)::DATE, vehicle_id, MIN(avl.timestamp)) * 2 AS id,
          bus_stops.id AS bus_stop_id, 
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

  return await database.query<any>(CREATE_TEMP_TABLE);
}

export async function cleanData() {
  const rows = await getRawData();
  const SET_TRIP_AND_SCHEDULED_DEPARTURE_OF_ID = `
  UPDATE visits_temp
    SET trip_id = $2, 
        scheduled_departure_id = $3, 
        scheduled = (SELECT enter::DATE + MAKE_INTERVAL(mins => minute_of_day)
                     FROM scheduled_departures WHERE id = $3),
        delta = exit - (SELECT enter::DATE + MAKE_INTERVAL(mins => minute_of_day)
                        FROM scheduled_departures WHERE id = $3)
    WHERE id = $1
  `;

  // Identify terminal exits
  let currentTripId = 0;
  let currentScheduledDepartureId = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.trip_id) continue;

    currentScheduledDepartureId = row.scheduled_departure_id;
    if (row.trip_id !== currentTripId && !row.is_terminal) {
      currentTripId = row.trip_id;
      for (let j = i - 1; j >= 0; j--) {
        const testRow = rows[j];
        if (testRow.is_terminal) {
          database.query(SET_TRIP_AND_SCHEDULED_DEPARTURE_OF_ID, [
            testRow.id,
            currentTripId,
            currentScheduledDepartureId - 1
          ]);
          break;
        }
      }
    }
  }
}

export async function getRawData() {
  const GET_ALL_ROWS = "SELECT * FROM visits_temp ORDER BY id";
  return database.query<any>(GET_ALL_ROWS).then(results => results.rows);
}

export async function dropTable() {
  const DROP_TABLE = "DROP TABLE IF EXISTS visits_temp";
  return database.query<any>(DROP_TABLE);
}

export async function getMedianDelta() {
  const GET_DELTA = `
    SELECT  bus_stop_id, 
            name,
            trip_id,
            scheduled_departure_id, 
            median(extract(epoch from delta)::NUMERIC) as median_delta,
            count(*)
            
      FROM visits_temp 
      WHERE delta IS NOT NULL
      AND skipped IS FALSE
      GROUP BY scheduled_departure_id, bus_stop_id, name, trip_id
      ORDER BY median(extract(epoch from delta)::NUMERIC) DESC
  `;
}
