// @flow

import express from "express";
import { Pool } from "pg";

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
  ssl: true,
});

app.get("/", (req, res) => {
  pool
    .query("SELECT * FROM locations")
    .then(results => res.status(200).json(results.rows))
    .catch(error => res.status(500).json(error));
});

app.get("/new", (req, res) => {
  pool
    .query(
      "INSERT INTO locations (timestamp, coords) VALUES ('1970-01-01 00:00:01 UTC', '(0,0)');"
    )
    .then(() => pool.query("SELECT * FROM locations"))
    .then(results => res.status(200).json(results.rows))
    .catch(error => res.status(500).json(error));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
