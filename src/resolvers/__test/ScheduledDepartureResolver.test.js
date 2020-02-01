// @flow

import {
  getScheduledDeparturesFromBusStopId,
  getScheduledDeparturesFromTripId
} from "../ScheduledDepartureResolver";
import { insertBusStop, insertScheduledDeparture } from "../../__test/insert";

import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";

describe("departure resolver", () => {
  test("gets scheduled departures from bus stop id", async () => {
    const busStopId = 8;
    await insertBusStop({ id: busStopId });
    const scheduledDepartures = [
      await insertScheduledDeparture({
        id: 1,
        minuteOfDay: 100,
        tripId: 1,
        busStopId
      }),
      await insertScheduledDeparture({
        id: 2,
        minuteOfDay: 200,
        tripId: 2,
        busStopId
      }),
      await insertScheduledDeparture({
        id: 3,
        minuteOfDay: 300,
        tripId: 3,
        busStopId
      })
    ];

    await insertBusStop({ id: busStopId + 1 });
    await insertScheduledDeparture({
      id: 4,
      minuteOfDay: 400,
      tripId: 1,
      busStopId: busStopId + 1
    });
    await insertScheduledDeparture({
      id: 5,
      minuteOfDay: 400,
      tripId: 2,
      busStopId: busStopId + 1
    });
    await insertScheduledDeparture({
      id: 6,
      minuteOfDay: 400,
      tripId: 3,
      busStopId: busStopId + 1
    });

    const actual = await getScheduledDeparturesFromBusStopId(busStopId);
    const expected = scheduledDepartures;

    expect(actual).toEqual(expected);
  });

  test("gets scheduled departures from trip id", async () => {
    const tripId = 8;
    await insertBusStop({ id: 1 });
    await insertBusStop({ id: 2 });
    await insertBusStop({ id: 3 });

    const scheduledDepartures = [
      await insertScheduledDeparture({
        id: 1,
        minuteOfDay: 100,
        tripId,
        busStopId: 1
      }),
      await insertScheduledDeparture({
        id: 2,
        minuteOfDay: 200,
        tripId,
        busStopId: 2
      }),
      await insertScheduledDeparture({
        id: 3,
        minuteOfDay: 300,
        tripId,
        busStopId: 3
      })
    ];

    await insertBusStop({ id: 4 });
    await insertScheduledDeparture({
      id: 4,
      minuteOfDay: 300,
      tripId: tripId + 1,
      busStopId: 4
    });

    const actual = await getScheduledDeparturesFromTripId(tripId);
    const expected = scheduledDepartures;

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
