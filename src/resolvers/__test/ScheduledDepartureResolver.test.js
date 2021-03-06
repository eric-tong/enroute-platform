// @flow

import {
  getScheduledDeparturesExceptLastInTripFromBusStopId,
  getScheduledDeparturesFromTripId
} from "../ScheduledDepartureResolver";
import { insertBusStop, insertScheduledDeparture } from "../../__test/insert";

import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";

describe("departure resolver", () => {
  test("gets scheduled departures except last in trip from bus stop id", async () => {
    const busStopId = 8;
    const minuteOfDay = new Date().valueOf() / 60;
    await insertBusStop({ id: busStopId });
    const scheduledDepartures = [
      await insertScheduledDeparture({
        minuteOfDay: minuteOfDay + 1,
        tripId: 1,
        busStopId
      }),
      await insertScheduledDeparture({
        minuteOfDay: minuteOfDay + 2,
        tripId: 2,
        busStopId
      }),
      await insertScheduledDeparture({
        minuteOfDay: minuteOfDay + 3,
        tripId: 3,
        busStopId
      })
    ];

    await insertBusStop({ id: busStopId + 1 });
    await insertScheduledDeparture({
      minuteOfDay: minuteOfDay + 100,
      tripId: 1,
      busStopId: busStopId + 1
    });
    await insertScheduledDeparture({
      minuteOfDay: minuteOfDay + 100,
      tripId: 2,
      busStopId: busStopId + 1
    });
    await insertScheduledDeparture({
      minuteOfDay: minuteOfDay + 100,
      tripId: 3,
      busStopId: busStopId + 1
    });

    const actual = await getScheduledDeparturesExceptLastInTripFromBusStopId(
      busStopId
    );
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
