// @flow

import { Pool } from "pg";

const database = new Pool({
  host: "localhost",
  port: 5432,
  database: process.env.DATABASE_NAME ?? "",
  user: process.env.DATABASE_USER ?? "",
  password: process.env.DATABASE_PASSWORD ?? ""
});

export default database;
