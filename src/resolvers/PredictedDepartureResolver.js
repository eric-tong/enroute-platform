// @flow

import { DateTime } from "luxon";
import database from "../database/database";

export const PREDICTED_DEPARTURE_COLUMNS = [
  "predicted_departures.id",
  `predicted_departures.scheduled_departure_id AS "scheduledDepartureId"`,
  `predicted_departures.avl_id AS "avlId"`,
  `(predicted_departures.predicted_timestamp - MAKE_INTERVAL(secs => COALESCE(predicted_departures.predicted_delta, 0)))::TEXT AS "predictedTimestamp"`
].join(", ");

export function getPredictedDepartureTodayFromScheduledDepartureId(
  scheduledDepartureId: number
) {
  const GET_PREDICTED_DEPARTURE_TODAY_FROM_SCHEDULED_DEPARTURE_ID = `
    SELECT ${PREDICTED_DEPARTURE_COLUMNS} FROM predicted_departures
      WHERE scheduled_departure_id = $1
      AND predicted_timestamp::DATE = NOW()::DATE
      ORDER BY avl_id DESC
      LIMIT 1
  `;
  return database
    .query<?PredictedDeparture>(
      GET_PREDICTED_DEPARTURE_TODAY_FROM_SCHEDULED_DEPARTURE_ID,
      [scheduledDepartureId]
    )
    .then(results => results.rows[0]);
}
