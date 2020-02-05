// @flow

import database from "../database/database";

const CHECK_IN_COLUMNS = [
  "id",
  "timestamp::text",
  `vehicle_id AS "vehicleId"`,
  `department_id AS "departmentId"`
]
  .map(column => "check_ins." + column)
  .join(", ");

export function createCheckIn(
  _: void,
  {
    departmentType,
    vehicleRegistration
  }: { departmentType: string, vehicleRegistration: string }
) {
  const CREATE_CHECK_IN = `
  WITH department AS (SELECT * FROM departments WHERE type = $1),
    vehicle AS (SELECT * FROM vehicles WHERE LOWER(registration) = LOWER($2))

  INSERT INTO check_ins (timestamp, vehicle_id, department_id)
      SELECT NOW() as timestamp, vehicle.id AS vehicle_id, department.id AS department_id FROM department CROSS JOIN vehicle
      RETURNING ${CHECK_IN_COLUMNS};`;
  return database
    .query<CheckIn>(CREATE_CHECK_IN, [departmentType, vehicleRegistration])
    .then(results => results.rows[0]);
}

export function checkOutFromCheckInId(_: void, { id }: { id: number }) {
  const CHECK_OUT = `DELETE FROM check_ins WHERE id = $1 RETURNING ${CHECK_IN_COLUMNS}`;
  return database
    .query<CheckIn>(CHECK_OUT, [id])
    .then(results => results.rows[0]);
}
