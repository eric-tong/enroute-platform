// @flow
import type { Coordinates } from "./DataTypes.flow";
import database from "./database";

type BusStop = {
  name: string,
  street: string,
  coords: Coordinates,
  icon: string,
};

const GET_ALL_BUS_STOPS = "SELECT * FROM busStops";

export function getBusStops(): Promise<BusStop[]> {
  return database.query(GET_ALL_BUS_STOPS).then(results => {
    (results.rows: BusStop[]);
    return results.rows;
  });
}

export function getBusStopsInOrder() {
  return getBusStops();
}
