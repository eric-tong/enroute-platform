// @flow

import database from "../../database/database";

export async function getMedianDelta() {
  const GET_MEDIAN_DELTA = `
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
        ORDER BY scheduled_departure_id
    `;
  return database
    .query<any>(GET_MEDIAN_DELTA)
    .then(results =>
      results.rows.map<[number, number]>(row => [
        row.scheduled_departure_id,
        Math.round(Math.round(row.median_delta) / 6) / 10
      ])
    )
    .then(rows => new Map<number, number>(rows));
}

export async function getStandardDeviation() {
  const GET_MEDIAN_DELTA = `
      SELECT  bus_stop_id, 
              name,
              trip_id,
              scheduled_departure_id, 
              stddev_pop(extract(epoch from delta)::NUMERIC) as median_delta,
              count(*)
              
        FROM visits_temp 
        WHERE delta IS NOT NULL
        AND skipped IS FALSE
        GROUP BY scheduled_departure_id, bus_stop_id, name, trip_id
        ORDER BY scheduled_departure_id
    `;
  return database
    .query<any>(GET_MEDIAN_DELTA)
    .then(results =>
      results.rows.map<[number, number]>(row => [
        row.scheduled_departure_id,
        Math.round(Math.round(row.median_delta) / 6) / 10
      ])
    )
    .then(rows => new Map<number, number>(rows));
}

export async function getScheduledDepartures() {
  const GET_SCHEDULED_DEPARTURES = `
    SELECT scheduled_departures.id, trip_id AS "tripId", bus_stops.id AS "busStopId", name, minute_of_day as "minuteOfDay"
        FROM scheduled_departures
        INNER JOIN bus_stops ON scheduled_departures.bus_stop_id = bus_stops.id
        ORDER BY trip_id, minute_of_day, bus_stops.id
    `;

  return await database
    .query<any>(GET_SCHEDULED_DEPARTURES)
    .then(results => results.rows);
}

export async function getSkippedCount() {
  const GET_SKIPPED_COUNT = `
    SELECT scheduled_departure_id, COUNT(*)
      FROM visits_temp
      WHERE skipped
      AND scheduled_departure_id IS NOT NULL
      GROUP BY scheduled_departure_id
      ORDER BY COUNT(*)
    `;

  return await database
    .query<any>(GET_SKIPPED_COUNT)
    .then(results =>
      results.rows.map<[number, number]>(row => [
        row.scheduled_departure_id,
        row.count
      ])
    )
    .then(rows => new Map<number, number>(rows));
}

export async function getEarlyCount() {
  const GET_SKIPPED_COUNT = `
    SELECT scheduled_departure_id, COUNT(*), MEDIAN(EXTRACT(epoch FROM delta)::NUMERIC)
      FROM visits_temp
      WHERE EXTRACT(epoch FROM delta) < 0
      AND scheduled_departure_id IS NOT NULL
      GROUP BY scheduled_departure_id
      ORDER BY COUNT(*) DESC
    `;

  return await database
    .query<any>(GET_SKIPPED_COUNT)
    .then(results =>
      results.rows.map<[number, number]>(row => [
        row.scheduled_departure_id,
        row.count
      ])
    )
    .then(rows => new Map<number, number>(rows));
}
