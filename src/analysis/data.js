// @flow

import database from "../database/database";
const tf = require("@tensorflow/tfjs-node");

export const MIN_MINUTE_OF_DAY = 430;
export const MAX_MINUTE_OF_DAY = 1200;
export const MIN_DISTANCE = 0;
export const MAX_DISTANCE = 10000;
export const MIN_DELTA = 0;
export const MAX_DELTA = 600;
export const BUS_STOP_COUNT = 7;

export const VALIDATION_SET_PERCENTAGE = 0;

export async function getData(tripId: number) {
  const allData = await getRawData(tripId);
  const tensors = tf.tidy(() => {
    tf.util.shuffle(allData);

    const inputs = allData.map(data => {
      return [normalize(data.distance, MIN_DISTANCE, MAX_DISTANCE)];
    });
    const labels = allData.map(data =>
      normalize(data.delta, MIN_DELTA, MAX_DELTA)
    );

    return {
      input: tf.tensor(inputs, [inputs.length, inputs[0].length]),
      label: tf.tensor(labels, [labels.length, 1])
    };
  });

  const validationSetSize = VALIDATION_SET_PERCENTAGE * allData.length;

  return {
    training: {
      input: tensors.input.slice(validationSetSize),
      label: tensors.label.slice(validationSetSize)
    },
    validation: {
      input: tensors.input.slice(0, validationSetSize),
      label: tensors.label.slice(0, validationSetSize)
    }
  };
}

async function getRawData(tripId: number) {
  const GET_DATA = `
    WITH actual_departures AS (
        SELECT scheduled_departure_id AS id, MIN(bus_stops.id) AS "busStopId",
        MIN(timestamp) AS arrival_timestamp, MIN(avl_trip.trip_id) AS trip
            FROM bus_stop_visits
            INNER JOIN avl ON avl.id = bus_stop_visits.avl_id
            INNER JOIN avl_trip ON avl.id = avl_trip.avl_id
            INNER JOIN bus_stops ON bus_stop_visits.bus_stop_id = bus_stops.id
            WHERE NOW()::DATE - timestamp::DATE < 7
            AND trip_id = $1
            GROUP BY scheduled_departure_id, timestamp::DATE
    )

    SELECT  EXTRACT(hour FROM avl.timestamp) * 60 + EXTRACT(minute FROM avl.timestamp) AS "minuteOfDay",
            actual_departures.*, 
            predicted_timestamp, 
            EXTRACT(epoch FROM predicted_timestamp - arrival_timestamp) AS delta, 
            distance
        FROM predicted_departures
        INNER JOIN actual_departures ON predicted_departures.scheduled_departure_id = actual_departures.id
        INNER JOIN avl ON predicted_departures.avl_id = avl.id
        WHERE actual_departures.arrival_timestamp::DATE = predicted_timestamp::DATE
        AND ABS(EXTRACT(epoch FROM predicted_timestamp - arrival_timestamp)) < $2
        AND distance < $3
    `;

  return await database
    .query<any>(GET_DATA, [tripId, MAX_DELTA, MAX_DISTANCE])
    .then(results => results.rows);
}

function normalize(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}
