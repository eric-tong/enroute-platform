CREATE TYPE "priority" AS ENUM (
  'low',
  'high',
  'panic'
);

CREATE TABLE "avl" (
  "id" SERIAL PRIMARY KEY,
  "vehicle_id" int NOT NULL,
  "event_io_id" int NOT NULL,
  "timestamp" timestamp NOT NULL,
  "priority" priority NOT NULL,
  "longitude" float NOT NULL,
  "latitude" float NOT NULL,
  "altitude" int NOT NULL,
  "angle" int NOT NULL,
  "satellites" smallint NOT NULL,
  "speed" int NOT NULL,
  "saved_timestamp" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "avl_trip_id" (
  "avl_id" int NOT NULL,
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
  "scheduled_departure_id" int NOT NULL,
  "is_proxy" boolean NOT NULL DEFAULT false
);

CREATE TABLE "check_ins" (
  "id" SERIAL PRIMARY KEY,
  "vehicle_id" int NOT NULL,
  "department_id" int NOT NULL,
  "timestamp" timestamp NOT NULL
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
  "bus_stop_id" int NOT NULL,
  "scheduled_departure_id" int NOT NULL,
  "predicted_timestamp" timestamp DEFAULT (now())
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

CREATE TABLE "sign_ins" (
  "id" SERIAL PRIMARY KEY,
  "vehicle_id" int NOT NULL,
  "department_id" int NOT NULL,
  "timestamp" timestamp NOT NULL
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

ALTER TABLE "avl" ADD FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id");

ALTER TABLE "avl_trip_id" ADD FOREIGN KEY ("avl_id") REFERENCES "avl" ("id");

ALTER TABLE "avl_trip_id" ADD FOREIGN KEY ("trip_id") REFERENCES "trips" ("id");

ALTER TABLE "bus_stop_proxies" ADD FOREIGN KEY ("bus_stop_id") REFERENCES "bus_stops" ("id");

ALTER TABLE "bus_stop_visits" ADD FOREIGN KEY ("avl_id") REFERENCES "avl" ("id");

ALTER TABLE "bus_stop_visits" ADD FOREIGN KEY ("bus_stop_id") REFERENCES "bus_stops" ("id");

ALTER TABLE "bus_stop_visits" ADD FOREIGN KEY ("scheduled_departure_id") REFERENCES "scheduled_departures" ("id");

ALTER TABLE "check_ins" ADD FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id");

ALTER TABLE "check_ins" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("id");

ALTER TABLE "io" ADD FOREIGN KEY ("avl_id") REFERENCES "avl" ("id");

ALTER TABLE "io" ADD FOREIGN KEY ("io_name_id") REFERENCES "io_names" ("id");

ALTER TABLE "predicted_departures" ADD FOREIGN KEY ("avl_id") REFERENCES "avl" ("id");

ALTER TABLE "predicted_departures" ADD FOREIGN KEY ("bus_stop_id") REFERENCES "bus_stops" ("id");

ALTER TABLE "predicted_departures" ADD FOREIGN KEY ("scheduled_departure_id") REFERENCES "scheduled_departures" ("id");

ALTER TABLE "routes" ADD FOREIGN KEY ("terminal_bus_stop_id") REFERENCES "bus_stops" ("id");

ALTER TABLE "scheduled_departures" ADD FOREIGN KEY ("trip_id") REFERENCES "trips" ("id");

ALTER TABLE "scheduled_departures" ADD FOREIGN KEY ("bus_stop_id") REFERENCES "bus_stops" ("id");

ALTER TABLE "sign_ins" ADD FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id");

ALTER TABLE "sign_ins" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("id");

ALTER TABLE "trips" ADD FOREIGN KEY ("route_id") REFERENCES "routes" ("id");
