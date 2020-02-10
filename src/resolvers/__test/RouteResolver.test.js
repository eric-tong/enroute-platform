// @flow

import { clearTables, randomId } from "../../__test/testUtils";
import { insertBusStop, insertScheduledDeparture } from "../../__test/insert";

import { DateTime } from "luxon";
import busStops from "../../__test/models/busStops";
import database from "../../database/database";
import { getRouteFromTripId } from "../RouteResolver";

describe("route resolver", () => {
  test("gets route from trip id", async () => {
    const tripId = randomId();
    await insertBusStop(busStops.begbrokeSciencePark);
    await insertBusStop(busStops.departmentOfMaterialsSouthbound);
    await insertBusStop(busStops.oxfordTownCentre);

    const now = DateTime.local();
    const minuteOfDay = now.hour * 60 + now.minute;
    await insertScheduledDeparture({
      tripId,
      busStopId: busStops.begbrokeSciencePark.id,
      minuteOfDay: minuteOfDay
    });
    await insertScheduledDeparture({
      tripId,
      busStopId: busStops.departmentOfMaterialsSouthbound.id,
      minuteOfDay: minuteOfDay + 20
    });
    await insertScheduledDeparture({
      tripId,
      busStopId: busStops.oxfordTownCentre.id,
      minuteOfDay: minuteOfDay + 30
    });
    await insertScheduledDeparture({
      tripId,
      busStopId: busStops.begbrokeSciencePark.id,
      minuteOfDay: minuteOfDay + 40
    });

    const actual = await getRouteFromTripId();

    expect(actual.length).toBeGreaterThan(10);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
