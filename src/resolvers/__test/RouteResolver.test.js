// @flow

import { insertBusStop, insertScheduledDepartures } from "../../__test/insert";

import busStops from "../../__test/models/busStops";
import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";
import { getRouteFromTripId } from "../RouteResolver";

describe("route resolver", () => {
  test("gets route from trip id", async () => {
    const tripId = 8;
    await insertBusStop(busStops.begbrokeSciencePark);
    await insertBusStop(busStops.departmentOfMaterialsSouthbound);
    await insertBusStop(busStops.oxfordTownCentre);
    await insertScheduledDepartures({
      id: 100,
      tripId,
      busStopId: busStops.begbrokeSciencePark.id,
      minuteOfDay: 100
    });
    await insertScheduledDepartures({
      id: 101,
      tripId,
      busStopId: busStops.departmentOfMaterialsSouthbound.id,
      minuteOfDay: 200
    });
    await insertScheduledDepartures({
      id: 102,
      tripId,
      busStopId: busStops.oxfordTownCentre.id,
      minuteOfDay: 300
    });
    await insertScheduledDepartures({
      id: 103,
      tripId,
      busStopId: busStops.begbrokeSciencePark.id,
      minuteOfDay: 400
    });

    const actual = await getRouteFromTripId();

    expect(actual.length).toBeGreaterThan(10);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
