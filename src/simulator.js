import moment from "moment";
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "enroute",
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  poolSize: 10,
});

export function getVehicle() {
  const getAllAvailableDates =
    "SELECT DATE(timestamp) FROM locations GROUP BY DATE(timestamp)";
  const getFirstAndLastRowsInDate = `
    (SELECT * FROM locations WHERE DATE(timestamp) = DATE($1) ORDER BY timestamp LIMIT 1)
    UNION ALL
    (SELECT * FROM locations WHERE DATE(timestamp) = DATE($1) ORDER BY timestamp DESC LIMIT 1)
    `;
  const getRowAfterDate =
    "SELECT * FROM locations WHERE timestamp > $1 ORDER BY timestamp LIMIT 1";

  const today = moment();
  return pool
    .query(getAllAvailableDates)
    .then(results => results.rows[today.dayOfYear() % results.rows.length].date)
    .then(day => pool.query(getFirstAndLastRowsInDate, [day]))
    .then(results => results.rows.map(({ timestamp }) => timestamp))
    .then(timestamps => {
      const start = moment(timestamps[0]);
      const end = moment(timestamps[1]);

      const translatedDate = today
        .clone()
        .dayOfYear(start.dayOfYear())
        .add(1, "hours");
      if (translatedDate.isBefore(start)) {
        translatedDate.add(7, "hours");
      } else if (translatedDate.isAfter(end)) {
        translatedDate.subtract(7, "hours");
      }

      return translatedDate;
    })
    .then(date => pool.query(getRowAfterDate, [date]))
    .then(results => results.rows[0]);
}
