// @flow

import database from "../database/database";
import { stringify } from "node-persist";

export function getDepartments() {
  return database
    .query<{ id: number, name: string }>("SELECT * FROM departments")
    .then(results => results.rows);
}
