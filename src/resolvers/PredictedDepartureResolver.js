// @flows

import database from "../database/database";

export const PREDICTED_DEPARTURE_COLUMNS = [
  "id",
  `scheduled_departure_id AS "scheduledDepartureId"`,
  `avl_id AS "avlId"`,
  `predicted_timestamp AS "predictedTimestamp"`
]
  .map(column => "predicted_departures." + column)
  .join(", ");

function getPredictedDepartureTodayFromScheduledDepartureId(
  scheduledDepartureId
) {
  return database.query();
}
