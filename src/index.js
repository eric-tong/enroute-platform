// @flow

import express from "express";
import { Pool } from "pg";

const app = express();
const port = process.env.PORT || 3000;

console.log(process.env);

const pool = new Pool({
  user: "eric",
  host: "localhost",
  database: "eric",
  password: "",
  port: 5432,
});

app.get("/", async (req, res) => {
  pool.query("SELECT * FROM users WHERE id = $1", [1], (error, results) => {
    if (error) {
      throw error;
    }
    if (results) {
      res.status(200).json(results.rows);
    }
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
