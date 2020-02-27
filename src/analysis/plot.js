// @flow

import "../service/config";

import database from "../database/database";
import { plot } from "nodeplotlib";

const trips = Array.from({ length: 5 }, (_, i) => i + 1);
Promise.all(
  trips.map(tripId => saveCSV(tripId).catch(console.error))
).then(data => data.forEach(graph => plot([graph])));

async function saveCSV(tripId: number) {
  const GET_DATA = `
      WITH actual_departures AS (
          SELECT scheduled_departure_id AS id, MIN(bus_stops.id) AS "busStopId",
          MIN(timestamp) AS arrival_timestamp, MIN(avl_trip.trip_id) AS trip
              FROM bus_stop_visits
              INNER JOIN avl ON avl.id = bus_stop_visits.avl_id
              INNER JOIN avl_trip ON avl.id = avl_trip.avl_id
              INNER JOIN bus_stops ON bus_stop_visits.bus_stop_id = bus_stops.id
              WHERE NOW()::DATE - timestamp::DATE < 10
              AND bus_stop_visits.is_proxy = TRUE
              AND trip_id = $1
              GROUP BY scheduled_departure_id, timestamp::DATE
      )
  
      SELECT  avl.timestamp,
              actual_departures.*, 
              predicted_timestamp, 
              distance,
              EXTRACT(epoch FROM predicted_timestamp - arrival_timestamp) AS delta 
          FROM predicted_departures
          INNER JOIN actual_departures ON predicted_departures.scheduled_departure_id = actual_departures.id
          INNER JOIN avl ON predicted_departures.avl_id = avl.id
          WHERE actual_departures.arrival_timestamp::DATE = predicted_timestamp::DATE
          AND ABS(EXTRACT(epoch FROM predicted_timestamp - arrival_timestamp)) < 600
      `;

  return await database
    .query(GET_DATA, [tripId])
    .then(results => results.rows)
    .then(rows => ({
      x: rows.map(row => row.distance),
      y: rows.map(row => row.delta),
      type: "scatter",
      mode: "markers",
      colorscale: "Portland",
      marker: {
        color: rows.map(row => row.busStopId * 10)
      },
      text: rows.map(row => `${row.busStopId}\n${row.timestamp}`)
    }));
}
