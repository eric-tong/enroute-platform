// @flow

import database from "./database";

type BusStop = {|
  id: number,
  name: string,
  street: string,
  coords: Coordinates,
  icon: string,
  arrivalTimes: number[],
|};

const GET_ALL_BUS_STOPS = `
SELECT busStops.id, busStops.name, busStops.street, busStops.coords, busStops.icon, array_agg(timetable.time) as "arrivalTimes"
  FROM busStops INNER JOIN (SELECT * FROM timetable ORDER BY time) as timetable
  ON busStops.id = timetable.busStopId 
  GROUP BY busStops.id
`;
const GET_ALL_BUS_STOPS_IN_ORDER =
  "SELECT coords FROM busStops INNER JOIN timetable ON busStops.id = timetable.busStopId WHERE timetable.tripId = 1 ORDER BY time";

export function getBusStops() {
  return database
    .query<BusStop>(GET_ALL_BUS_STOPS)
    .then(results => results.rows);
}

export function getBusStopsInOrder() {
  return database
    .query<BusStop>(GET_ALL_BUS_STOPS_IN_ORDER)
    .then(results => results.rows);
}
