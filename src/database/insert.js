// @flow

import database from "./database";

export async function insertBusStop(busStop: BusStop) {
  const INSERT_INTO_BUS_STOP = `
  INSERT INTO bus_stops (id, name, street, icon, longitude, latitude, direction, 
    display_position, is_terminal, road_angle, url)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
  return database.query<{}>(INSERT_INTO_BUS_STOP, [
    busStop.id,
    busStop.name,
    busStop.street,
    busStop.icon,
    busStop.longitude,
    busStop.latitude,
    busStop.direction,
    0,
    busStop.isTerminal,
    busStop.roadAngle,
    busStop.url
  ]);
}

export async function insertScheduledDepartures(
  scheduledDeparture: ScheduledDeparture
) {
  const INSERT_INTO_BUS_STOP = `
  INSERT INTO scheduled_departures (id, minute_of_day, trip_id, bus_stop_id)
    VALUES($1, $2, $3, $4)`;
  return database.query<{}>(INSERT_INTO_BUS_STOP, [
    scheduledDeparture.id,
    scheduledDeparture.minuteOfDay,
    scheduledDeparture.tripId,
    scheduledDeparture.busStopId
  ]);
}
