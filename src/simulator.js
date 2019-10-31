import moment from "moment";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
  ssl: true,
});

export function getVehiclePosition() {
  const firstAndLastRowQuery = `
    (SELECT * FROM locations ORDER BY timestamp LIMIT 1)
    UNION ALL
    (SELECT * FROM locations ORDER BY timestamp DESC LIMIT 1)
  `;
  const firstRowAfterTimestamp = `
    SELECT * FROM locations WHERE timestamp > $1 ORDER BY timestamp LIMIT 1
  `;

  return pool
    .query(firstAndLastRowQuery)
    .then(results => results.rows)
    .then(rows => rows.map(row => moment(row.timestamp)))
    .then(getTranslatedDate)
    .then(date => pool.query(firstRowAfterTimestamp, [date]))
    .then(results => results.rows);
}

function getTranslatedDate(dates) {
  const today = moment();
  const start = dates[0].add(1, "days");
  const end = dates[1];

  const duration = end.diff(start, "weeks");
  const weeksSinceStart = today.diff(start, "weeks");
  const translatedWeeksSinceStart = weeksSinceStart % duration;

  const translatedDate = today
    .clone()
    .week(start.week() + translatedWeeksSinceStart)
    .add(1, "hours");
  if (translatedDate.isBefore(start)) translatedDate.add(1, "weeks");
  else if (translatedDate.isAfter(end)) translatedDate.subtract(1, "weeks");

  return translatedDate;
}
