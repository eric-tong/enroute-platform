// @flow

import { AVL_COLUMNS } from "../resolvers/AvlResolver";
import { BUS_STOP_COLUMNS } from "../resolvers/BusStopResolver";
import { DateTime } from "luxon";
import { PREDICTED_DEPARTURE_COLUMNS } from "../resolvers/PredictedDepartureResolver";
import { SCHEDULED_DEPARTURE_COLUMNS } from "../resolvers/ScheduledDepartureResolver";
import database from "../database/database";
import { randomId } from "./testUtils";

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

  const mockVehicleId = randomId();
  if (!avl.vehicleId) await insertVehicle({ id: mockVehicleId });

  return database
    .query<AVL>(INSERT_AVL, [
      avl.id ?? randomId(),
      avl.timestamp ?? DateTime.local().toSQL(),
      avl.priority ?? "low",
      avl.longitude ?? 0,
      avl.latitude ?? 0,
      avl.altitude ?? 0,
      avl.angle ?? 0,
      avl.satellites ?? 0,
      avl.speed ?? 0,
      avl.vehicleId ?? mockVehicleId,
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
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING ${BUS_STOP_COLUMNS}`;
  return database
    .query<BusStop>(INSERT_INTO_BUS_STOP, [
      busStop.id ?? randomId(),
      busStop.name ?? 0,
      busStop.street ?? 0,
      busStop.icon ?? 0,
      busStop.longitude ?? 0,
      busStop.latitude ?? 0,
      busStop.direction ?? 0,
      0,
      busStop.isTerminal ?? 0,
      busStop.roadAngle,
      busStop.url ?? randomId().toString()
    ])
    .then(results => results.rows[0]);
}

export async function insertBusStopProxy(busStopProxy: {|
  busStopId: number,
  longitude: number,
  latitude: number,
  roadAngle?: number
|}) {
  const INSERT_INTO_BUS_STOP_PROXY = `
    INSERT INTO bus_stop_proxies (bus_stop_id, longitude, latitude, road_angle)
      VALUES ($1, $2, $3, $4)
  `;
  return database.query<{}>(INSERT_INTO_BUS_STOP_PROXY, [
    busStopProxy.busStopId,
    busStopProxy.longitude,
    busStopProxy.latitude,
    busStopProxy.roadAngle
  ]);
}

export async function insertBusStopVisit(busStopVisit: {|
  avlId?: number,
  busStopId?: number,
  scheduledDepartureId?: number
|}) {
  if (!busStopVisit.avlId) await insertAvl({ id: 0 });
  if (!busStopVisit.busStopId) await insertBusStop({ id: 0 });

  return database.query<{}>(
    "INSERT INTO bus_stop_visits (avl_id, bus_stop_id, scheduled_departure_id) VALUES ($1, $2, $3)",
    [
      busStopVisit.avlId ?? 0,
      busStopVisit.busStopId ?? 0,
      busStopVisit.scheduledDepartureId ?? 0
    ]
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

export async function insertIo(io: IO, avlId: number) {
  const ioNameId = randomId(32000);

  await insertIoName({ id: ioNameId, value: io.name });
  const INSERT_IO =
    "INSERT INTO io (avl_id, io_name_id, value) VALUES($1, $2, $3)";
  await database.query(INSERT_IO, [avlId, ioNameId, io.value]);
}

export async function insertIoName(ioName: { id: number, value: string }) {
  const INSERT_IO_NAME = "INSERT INTO io_names (id, value) VALUES($1, $2)";
  await database.query(INSERT_IO_NAME, [ioName.id, ioName.value]);
}

export function insertPredictedDeparture(
  predictedDeparture:
    | PredictedDeparture
    | {|
        id?: number,
        scheduledDepartureId?: number,
        avlId?: number,
        predictedTimestamp?: string
      |}
) {
  const INSERT_PREDICTED_DEPARTURE = `
  INSERT INTO predicted_departures (id, scheduled_departure_id, avl_id, predicted_timestamp)
    VALUES($1, $2, $3, $4)
    RETURNING ${PREDICTED_DEPARTURE_COLUMNS}
  `;
  return database
    .query(INSERT_PREDICTED_DEPARTURE, [
      predictedDeparture.id ?? randomId(),
      predictedDeparture.scheduledDepartureId ?? 0,
      predictedDeparture.avlId ?? 0,
      predictedDeparture.predictedTimestamp ?? DateTime.local().toSQL()
    ])
    .then(results => results.rows[0]);
}

export async function insertScheduledDeparture(
  scheduledDeparture:
    | ScheduledDeparture
    | {|
        id?: number,
        minuteOfDay?: number,
        tripId?: number,
        busStopId?: number
      |}
) {
  const INSERT_INTO_SCHEDULED_DEPARTURES = `
  INSERT INTO scheduled_departures (id, minute_of_day, trip_id, bus_stop_id)
    VALUES($1, $2, $3, $4)
    RETURNING ${SCHEDULED_DEPARTURE_COLUMNS}`;

  return database
    .query<ScheduledDeparture>(INSERT_INTO_SCHEDULED_DEPARTURES, [
      scheduledDeparture.id ?? randomId(),
      scheduledDeparture.minuteOfDay ?? 0,
      scheduledDeparture.tripId ?? 0,
      scheduledDeparture.busStopId ?? randomId()
    ])
    .then(results => results.rows[0]);
}

export function insertVehicle(
  vehicle:
    | Vehicle
    | {|
        id?: number,
        registration?: string,
        imei?: string,
        phone?: string
      |}
) {
  const INSERT_AVL = `
    INSERT INTO vehicles (id, registration, imei, phone) 
      VALUES ($1, $2, $3, $4)
      RETURNING *
  `;
  return database
    .query<Vehicle>(INSERT_AVL, [
      vehicle.id ?? 0,
      vehicle.registration ?? "",
      vehicle.imei ?? "",
      vehicle.phone ?? ""
    ])
    .then(results => results.rows[0]);
}
