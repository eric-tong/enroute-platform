// @flow

import database from "../database/database";
import { stringify } from "node-persist";

export function getDepartments() {
  return database
    .query<{ id: number, name: string }>("SELECT * FROM departments")
    .then(results => results.rows);
}

export function createCheckIn(
  _: void,
  {
    userType,
    vehicleRegistration
  }: { userType: string, vehicleRegistration: string }
) {
  const CREATE_CHECK_IN = `
  WITH department AS (SELECT * FROM departments WHERE type = $1),
    vehicle AS (SELECT * FROM vehicles WHERE LOWER(registration) = LOWER($2))

  INSERT INTO check_ins (timestamp, vehicle_id, department_id)
      SELECT NOW() as timestamp, vehicle.id AS vehicle_id, department.id AS department_id FROM department CROSS JOIN vehicle
      RETURNING id;`;
  return database
    .query<{ id: number }>(CREATE_CHECK_IN, [userType, vehicleRegistration])
    .then(results => results.rows.length && results.rows[0].id);
}
