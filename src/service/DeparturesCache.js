// @flow

import NodeCache from "node-cache";
import { getAllBusStops } from "../resolvers/BusStopResolver";
import { getUpcomingDeparturesFromBusStop } from "../resolvers/DepartureResolver";

export const departuresCacheByBusStopId = new NodeCache();

export async function updateDeparturesCache() {
  const busStops = await getAllBusStops();
  return await Promise.all(
    busStops.map(busStop =>
      getUpcomingDeparturesFromBusStop(busStop).then(departures => {
        departuresCacheByBusStopId.set(busStop.id, departures);
        return departures;
      })
    )
  );
}
