// @flow

import database from "../database/database";

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
      RETURNING id;`;
  return database
    .query<{ id: number }>(CREATE_CHECK_IN, [
      departmentType,
      vehicleRegistration
    ])
    .then(results => (results.rows.length ? results.rows[0].id : -1));
}

export function checkOutFromCheckInId(_: void, { id }: { id: number }) {
  const CHECK_OUT = "DELETE FROM check_ins WHERE id = $1 RETURNING id";
  return database
    .query<{ id: number }>(CHECK_OUT, [id])
    .then(results => (results.rows.length ? results.rows[0].id : -1));
}
