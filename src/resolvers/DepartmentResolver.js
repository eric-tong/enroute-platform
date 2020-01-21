// @flow

import type { Department } from "../graphql/DepartmentSchema";
import database from "../database/database";

export function getAllDepartments() {
  const GET_ALL_DEPARTMENTS = "SELECT * FROM departments";
  return database
    .query<Department>(GET_ALL_DEPARTMENTS)
    .then(results => results.rows);
}
