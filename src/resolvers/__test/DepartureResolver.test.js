// @flow

import { insertBusStop, insertScheduledDepartures } from "../../__test/insert";

import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";
import { getScheduledDeparturesFromBusStopId } from "../DepartureResolver";

describe("departure resolver", () => {
  test("gets scheduled departures from bus stop id", async () => {
    const busStopId = 8;
    await insertBusStop({ id: busStopId });
    const scheduledDepartures = [
      await insertScheduledDepartures({
        id: 1,
        minuteOfDay: 100,
        tripId: 1,
        busStopId
      }),
      await insertScheduledDepartures({
        id: 2,
        minuteOfDay: 200,
        tripId: 2,
        busStopId
      }),
      await insertScheduledDepartures({
        id: 3,
        minuteOfDay: 300,
        tripId: 3,
        busStopId
      })
    ];

    await insertBusStop({ id: busStopId + 1 });
    await insertScheduledDepartures({
      id: 4,
      minuteOfDay: 400,
      tripId: 1,
      busStopId: busStopId + 1
    });
    await insertScheduledDepartures({
      id: 5,
      minuteOfDay: 400,
      tripId: 2,
      busStopId: busStopId + 1
    });
    await insertScheduledDepartures({
      id: 6,
      minuteOfDay: 400,
      tripId: 3,
      busStopId: busStopId + 1
    });

    const actual = await getScheduledDeparturesFromBusStopId(busStopId);
    const expected = scheduledDepartures;

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
