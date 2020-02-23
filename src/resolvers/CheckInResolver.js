// @flow

import database from "../database/database";

const CHECK_IN_COLUMNS = [
  "id",
  `user_id AS "userId"`,
  `origin_id AS "originId"`,
  `destination_id AS "destinationId"`,
  "timestamp::text",
  "remarks"
]
  .map(column => "check_ins." + column)
  .join(", ");

export function createCheckIn(
  _: void,
  {
    userId = 0,
    originId,
    destinationId,
    remarks
  }: {
    userId: ?number,
    originId: number,
    destinationId: number,
    remarks: ?string
  }
) {
  const CREATE_CHECK_IN = `
  INSERT INTO check_ins (user_id, origin_id, destination_id, remarks)
    VALUES ($1, $2, $3, $4)
    RETURNING ${CHECK_IN_COLUMNS}
  `;
  return database
    .query<CheckIn>(CREATE_CHECK_IN, [userId, originId, destinationId, remarks])
    .then(results => results.rows[0]);
}

export function checkOutFromCheckInId(_: void, { id }: { id: number }) {
  const CHECK_OUT = `DELETE FROM check_ins WHERE id = $1 RETURNING ${CHECK_IN_COLUMNS}`;
  return database
    .query<CheckIn>(CHECK_OUT, [id])
    .then(results => results.rows[0]);
}
