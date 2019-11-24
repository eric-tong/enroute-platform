// @flow

import type { Coordinates } from "../DataTypes";
import database from "./database";
import moment from "moment";

type Vehicle = {| coords: Coordinates |};

export function getVehicle() {
  const getAllAvailableDates =
    "SELECT DATE(timestamp) FROM locations GROUP BY DATE(timestamp)";
  const getFirstAndLastRowsInDate = `
    (SELECT * FROM locations WHERE DATE(timestamp) = DATE($1) ORDER BY timestamp LIMIT 1)
    UNION ALL
    (SELECT * FROM locations WHERE DATE(timestamp) = DATE($1) ORDER BY timestamp DESC LIMIT 1)
    `;
  const getRowAfterDate =
    "SELECT * FROM locations WHERE timestamp < $1 ORDER BY timestamp DESC LIMIT 2";

  const today = moment();
  return database
    .query<{ date: string }>(getAllAvailableDates)
    .then(results => results.rows[today.dayOfYear() % results.rows.length].date)
    .then(day => database.query(getFirstAndLastRowsInDate, [day]))
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
    .then(date => database.query<Vehicle>(getRowAfterDate, [date]))
    .then(results => {
      const current = results.rows[0];
      const previous = results.rows[1];
      const bearing =
        (Math.atan2(
          current.coords.y - previous.coords.y,
          current.coords.x - previous.coords.x
        ) /
          Math.PI) *
        180;

      return { ...current, bearing };
    });
}
