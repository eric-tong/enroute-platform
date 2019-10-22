// @flow

import express from "express";
import { Pool } from "pg";

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
  ssl: true,
});

app.get("/", async (req, res) => {
  pool.query("SELECT * FROM users", (error, results) => {
    if (error) {
      throw error;
    }
    if (results) {
      res.status(200).json(results.rows);
    }
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
