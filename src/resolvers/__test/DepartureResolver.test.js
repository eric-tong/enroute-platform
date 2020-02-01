// @flow

import { clearTables, randomId } from "../../__test/testUtils";
import {
  getDeparturesFromBusStop,
  getDeparturesFromTripId
} from "../DepartureResolver";
import { insertBusStop, insertScheduledDeparture } from "../../__test/insert";

import database from "../../database/database";

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

  test("gets departure from trip id", async () => {
    const tripId = randomId();
    const departures = [
      {
        scheduledDeparture: await insertScheduledDeparture({
          minuteOfDay: 100,
          tripId
        })
      },
      {
        scheduledDeparture: await insertScheduledDeparture({
          minuteOfDay: 200,
          tripId
        })
      },
      {
        scheduledDeparture: await insertScheduledDeparture({
          minuteOfDay: 300,
          tripId
        })
      }
    ];

    const actual = await getDeparturesFromTripId(tripId, {});
    const expected = departures;

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
