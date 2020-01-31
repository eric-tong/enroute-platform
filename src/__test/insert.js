// @flow

import { AVL_COLUMNS } from "../resolvers/AvlResolver";
import { DateTime } from "luxon";
import database from "../database/database";

export async function insertAvl(
  avl:
    | AVL
    | {|
        id?: number,
        priority?: string,
        timestamp?: number,
        altitude?: number,
        longitude?: number,
        latitude?: number,
        angle?: number,
        satellites?: number,
        speed?: number,
        vehicleId?: number
      |}
) {
  const INSERT_AVL = `
      INSERT INTO avl (id, timestamp, priority, longitude, latitude, altitude, angle, satellites, speed, vehicle_id, event_io_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING ${AVL_COLUMNS}
    `;

  if (!avl.vehicleId) await insertVehicle({ id: 0 });

  return database
    .query<AVL>(INSERT_AVL, [
      avl.id ?? 0,
      avl.timestamp ?? DateTime.local().toSQL(),
      avl.priority ?? "low",
      avl.longitude ?? 0,
      avl.latitude ?? 0,
      avl.altitude ?? 0,
      avl.angle ?? 0,
      avl.satellites ?? 0,
      avl.speed ?? 0,
      avl.vehicleId ?? 0,
      0
    ])
    .then(results => results.rows[0]);
}

export function insertBusStop(
  busStop:
    | BusStop
    | {|
        id?: number,
        name?: string,
        street?: string,
        icon?: string,
        url?: string,
        direction?: string,
        latitude?: number,
        longitude?: number,
        roadAngle?: ?number,
        isTerminal?: boolean
      |}
) {
  const INSERT_INTO_BUS_STOP = `
  INSERT INTO bus_stops (id, name, street, icon, longitude, latitude, direction, 
    display_position, is_terminal, road_angle, url)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
  return database.query<{}>(INSERT_INTO_BUS_STOP, [
    busStop.id ?? 0,
    busStop.name ?? 0,
    busStop.street ?? 0,
    busStop.icon ?? 0,
    busStop.longitude ?? 0,
    busStop.latitude ?? 0,
    busStop.direction ?? 0,
    0,
    busStop.isTerminal ?? 0,
    busStop.roadAngle,
    busStop.url ?? 0
  ]);
}

export async function insertBusStopVisit(busStopVisit: {|
  avlId?: number,
  busStopId?: number
|}) {
  if (!busStopVisit.avlId) await insertAvl({ id: 0 });
  if (!busStopVisit.busStopId) await insertBusStop({ id: 0 });

  return database.query<{}>(
    "INSERT INTO bus_stop_visits (avl_id, bus_stop_id) VALUES ($1, $2)",
    [busStopVisit.avlId ?? 0, busStopVisit.busStopId ?? 0]
  );
}

export function insertDepartment(
  department:
    | Department
    | {|
        id?: number,
        name?: string,
        type?: string
      |}
) {
  const INSERT_DEPARTMENT =
    "INSERT INTO departments (id, name, type) VALUES($1, $2, $3) RETURNING *";
  return database
    .query<Department>(INSERT_DEPARTMENT, [
      department.id ?? 0,
      department.name ?? "",
      department.type ?? ""
    ])
    .then(results => results.rows[0]);
}

export function insertScheduledDepartures(
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

export function insertVehicle(
  vehicle:
    | Vehicle
    | {|
        id?: number,
        registration?: string,
        imei?: string
      |}
) {
  const INSERT_AVL = `
    INSERT INTO vehicles (id, registration, imei) 
      VALUES ($1, $2, $3)
      RETURNING *
  `;
  return database
    .query<Vehicle>(INSERT_AVL, [
      vehicle.id ?? 0,
      vehicle.registration ?? "",
      vehicle.imei ?? ""
    ])
    .then(results => results.rows[0]);
}

function randomId() {
  return Math.floor(Math.random() * 100000);
}
