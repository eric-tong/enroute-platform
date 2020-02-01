// @flow

import { insertBusStop, insertScheduledDeparture } from "../../__test/insert";

import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";
import { getDeparturesFromBusStop } from "../DepartureResolver";

describe("departure resolver", () => {
  test("gets departure from bus stop", async () => {
    const busStop = await insertBusStop({});
    const departures = [
      {
        scheduledDeparture: await insertScheduledDeparture({
          busStopId: busStop.id,
          minuteOfDay: 100
        })
      },
      {
        scheduledDeparture: await insertScheduledDeparture({
          busStopId: busStop.id,
          minuteOfDay: 200
        })
      },
      {
        scheduledDeparture: await insertScheduledDeparture({
          busStopId: busStop.id,
          minuteOfDay: 300
        })
      }
    ];

    const actual = await getDeparturesFromBusStop(busStop, {});
    const expected = departures.slice(0, -1); // The last stop is not included in scheduled departures

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
