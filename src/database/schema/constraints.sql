
ALTER TABLE "avl" ADD FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id");

ALTER TABLE "avl_trip" ADD FOREIGN KEY ("avl_id") REFERENCES "avl" ("id");

ALTER TABLE "avl_trip" ADD FOREIGN KEY ("trip_id") REFERENCES "trips" ("id");

ALTER TABLE "bus_stop_proxies" ADD FOREIGN KEY ("bus_stop_id") REFERENCES "bus_stops" ("id");

ALTER TABLE "bus_stop_visits" ADD FOREIGN KEY ("avl_id") REFERENCES "avl" ("id");

ALTER TABLE "bus_stop_visits" ADD FOREIGN KEY ("bus_stop_id") REFERENCES "bus_stops" ("id");

ALTER TABLE "bus_stop_visits" ADD FOREIGN KEY ("scheduled_departure_id") REFERENCES "scheduled_departures" ("id");

ALTER TABLE "check_ins" ADD FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id");

ALTER TABLE "check_ins" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("id");

ALTER TABLE "io" ADD FOREIGN KEY ("avl_id") REFERENCES "avl" ("id");

ALTER TABLE "io" ADD FOREIGN KEY ("io_name_id") REFERENCES "io_names" ("id");

ALTER TABLE "predicted_departures" ADD FOREIGN KEY ("avl_id") REFERENCES "avl" ("id");

ALTER TABLE "predicted_departures" ADD FOREIGN KEY ("scheduled_departure_id") REFERENCES "scheduled_departures" ("id");

ALTER TABLE "routes" ADD FOREIGN KEY ("terminal_bus_stop_id") REFERENCES "bus_stops" ("id");

ALTER TABLE "scheduled_departures" ADD FOREIGN KEY ("trip_id") REFERENCES "trips" ("id");

ALTER TABLE "scheduled_departures" ADD FOREIGN KEY ("bus_stop_id") REFERENCES "bus_stops" ("id");

ALTER TABLE "sign_ins" ADD FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id");

ALTER TABLE "sign_ins" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("id");

ALTER TABLE "trips" ADD FOREIGN KEY ("route_id") REFERENCES "routes" ("id");