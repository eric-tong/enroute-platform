// @flow

import { DateTime } from "luxon";
import database from "../database/database";

export const PREDICTED_DEPARTURE_COLUMNS = [
  "id",
  `scheduled_departure_id AS "scheduledDepartureId"`,
  `avl_id AS "avlId"`,
  `predicted_timestamp AS "predictedTimestamp"`
]
  .map(column => "predicted_departures." + column)
  .join(", ");

export function getPredictedDepartureTodayFromScheduledDepartureId(
  scheduledDepartureId: number
) {
  const GET_PREDICTED_DEPARTURE_TODAY_FROM_SCHEDULED_DEPARTURE_ID = `
    SELECT ${PREDICTED_DEPARTURE_COLUMNS} FROM predicted_departures
      INNER JOIN avl ON predicted_departures.avl_id = avl.id
      WHERE scheduled_departure_id = $1
      AND predicted_timestamp::DATE = NOW()::DATE
      ORDER BY avl.timestamp DESC
      LIMIT 1
  `;
  return database
    .query<?PredictedDeparture>(
      GET_PREDICTED_DEPARTURE_TODAY_FROM_SCHEDULED_DEPARTURE_ID,
      [scheduledDepartureId]
    )
    .then(results => results.rows[0]);
}
