// @flow

import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "enroute",
  user: process.env.DATABASE_USER ?? "",
  password: process.env.DATABASE_PASSWORD ?? "",
});

export default pool;
