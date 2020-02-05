CREATE TYPE "priority" AS ENUM (
  'low',
  'high',
  'panic'
);

CREATE TABLE "avl" (
  "id" SERIAL PRIMARY KEY,
  "vehicle_id" int NOT NULL,
  "event_io_id" int NOT NULL,
  "timestamp" timestamptz NOT NULL,
  "priority" priority NOT NULL,
  "longitude" float NOT NULL,
  "latitude" float NOT NULL,
  "altitude" int NOT NULL,
  "angle" int NOT NULL,
  "satellites" smallint NOT NULL,
  "speed" int NOT NULL,
  "saved_timestamp" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "avl_trip" (
  "avl_id" SERIAL PRIMARY KEY,
  "trip_id" int NOT NULL
);

CREATE TABLE "bus_stops" (
  "id" SERIAL PRIMARY KEY,
  "url" text UNIQUE NOT NULL,
  "name" text NOT NULL,
  "street" text NOT NULL,
  "direction" text NOT NULL,
  "icon" char NOT NULL,
  "longitude" float NOT NULL,
  "latitude" float NOT NULL,
  "road_angle" int,
  "is_terminal" boolean NOT NULL DEFAULT false,
  "display_position" int
);

CREATE TABLE "bus_stop_proxies" (
  "bus_stop_id" int NOT NULL,
  "longitude" float NOT NULL,
  "latitude" float NOT NULL,
  "road_angle" int
);

CREATE TABLE "bus_stop_visits" (
  "avl_id" int PRIMARY KEY,
  "bus_stop_id" int NOT NULL,
  "scheduled_departure_id" int,
  "is_proxy" boolean NOT NULL DEFAULT false
);

CREATE TABLE "check_ins" (
  "id" SERIAL PRIMARY KEY,
  "vehicle_id" int NOT NULL,
  "department_id" int NOT NULL,
  "timestamp" timestamptz NOT NULL
);

CREATE TABLE "departments" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,
  "type" text NOT NULL
);

CREATE TABLE "io" (
  "avl_id" int NOT NULL,
  "io_name_id" smallint NOT NULL,
  "value" int NOT NULL
);

CREATE TABLE "io_names" (
  "id" smallint PRIMARY KEY,
  "value" text NOT NULL
);

CREATE TABLE "predicted_departures" (
  "id" SERIAL PRIMARY KEY,
  "avl_id" int NOT NULL,
  "scheduled_departure_id" int NOT NULL,
  "predicted_timestamp" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "routes" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,
  "terminal_bus_stop_id" int NOT NULL
);

CREATE TABLE "scheduled_departures" (
  "id" SERIAL PRIMARY KEY,
  "trip_id" int NOT NULL,
  "bus_stop_id" int NOT NULL,
  "minute_of_day" int NOT NULL
);

CREATE TABLE "trips" (
  "id" SERIAL PRIMARY KEY,
  "route_id" int NOT NULL
);

CREATE TABLE "vehicles" (
  "id" SERIAL PRIMARY KEY,
  "registration" text NOT NULL,
  "imei" text NOT NULL,
  "phone" text NOT NULL
);
