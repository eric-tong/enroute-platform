// @flow

import database from "../database/database";

export function getDepartments() {
  return database
    .query<{ id: number, name: string }>("SELECT * FROM departments")
    .then(results => results.rows);
}
