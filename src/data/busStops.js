// @flow

import database from "./database";

type BusStop = {
  name: string,
  street: string,
  coords: Coordinates,
  icon: string,
};

const GET_ALL_BUS_STOPS = "SELECT * FROM busStops";
const GET_ALL_BUS_STOPS_IN_ORDER =
  "SELECT coords FROM busStops INNER JOIN timetable ON busStops.id = timetable.busStopId WHERE timetable.tripId = 1 ORDER BY time";

export function getBusStops(): Promise<BusStop[]> {
  return database.query(GET_ALL_BUS_STOPS).then(results => results.rows);
}

export function getBusStopsInOrder(): Promise<BusStop[]> {
  return database
    .query(GET_ALL_BUS_STOPS_IN_ORDER)
    .then(results => results.rows);
}
