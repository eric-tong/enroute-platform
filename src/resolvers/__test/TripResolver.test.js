// @flow

import { insertBusStop, insertScheduledDepartures } from "../../__test/insert";

import { DateTime } from "luxon";
import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";
import { getTripIdWithNearestStartTime } from "../TripResolver";

describe("trip resolver", () => {
  test("gets trip id with nearest start time", async () => {
    const tripId = 500;
    const now = DateTime.local();
    const minuteOfDay = now.hour * 60 + now.minute;

    await insertBusStop({ id: 9 });
    await insertScheduledDepartures({
      id: 100,
      tripId,
      busStopId: 9,
      minuteOfDay: minuteOfDay
    });
    await insertScheduledDepartures({
      id: 200,
      tripId,
      busStopId: 9,
      minuteOfDay: minuteOfDay - 60
    });
    await insertScheduledDepartures({
      id: 300,
      tripId,
      busStopId: 9,
      minuteOfDay: minuteOfDay + 60
    });

    const actual = await getTripIdWithNearestStartTime();
    const expected = tripId;

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
