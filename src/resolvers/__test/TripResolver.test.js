// @flow

import { clearTables, randomId } from "../../__test/testUtils";
import {
  getTripIdFromVehicleId,
  getTripIdWithNearestStartTime
} from "../TripResolver";
import {
  insertAvl,
  insertBusStop,
  insertBusStopVisit,
  insertScheduledDeparture,
  insertVehicle
} from "../../__test/insert";

import { DateTime } from "luxon";
import busStops from "../../__test/models/busStops";
import database from "../../database/database";

describe("trip resolver", () => {
  test("gets trip id with nearest start time", async () => {
    const tripId = 500;
    const now = DateTime.local();
    const minuteOfDay = now.hour * 60 + now.minute;

    await insertBusStop({ id: 9 });
    await insertScheduledDeparture({
      id: 100,
      tripId,
      busStopId: 9,
      minuteOfDay: minuteOfDay
    });
    await insertScheduledDeparture({
      id: 200,
      tripId,
      busStopId: 9,
      minuteOfDay: minuteOfDay - 60
    });
    await insertScheduledDeparture({
      id: 300,
      tripId,
      busStopId: 9,
      minuteOfDay: minuteOfDay + 60
    });

    const actual = await getTripIdWithNearestStartTime();
    const expected = tripId;

    expect(actual).toEqual(expected);
  });

  test("gets trip id from vehicle id", async () => {
    const vehicleId = randomId();
    const tripId = randomId();
    const terminalBusStopId = randomId();
    const nonTerminalBusStopId = randomId();
    const terminalAvlId = randomId();
    const currentAvlId = randomId();

    const minuteOfDay = 100;

    await insertVehicle({ id: vehicleId });
    await insertBusStop({ id: terminalBusStopId, isTerminal: true });
    await insertBusStop({ id: nonTerminalBusStopId, isTerminal: false });
    await insertScheduledDeparture({
      id: randomId(),
      tripId,
      busStopId: terminalBusStopId,
      minuteOfDay: minuteOfDay
    });
    await insertScheduledDeparture({
      id: randomId(),
      tripId: tripId + 1,
      busStopId: terminalBusStopId,
      minuteOfDay: minuteOfDay + 50
    });
    await insertScheduledDeparture({
      id: randomId(),
      tripId,
      busStopId: nonTerminalBusStopId,
      minuteOfDay: minuteOfDay + 100
    });

    await insertAvl({
      id: terminalAvlId,
      timestamp: DateTime.local()
        .startOf("day")
        .plus({ minutes: minuteOfDay + 5 })
        .toSQL(),
      vehicleId
    });
    await insertBusStopVisit({
      avlId: terminalAvlId,
      busStopId: terminalBusStopId
    });

    await insertAvl({
      id: currentAvlId,
      timestamp: DateTime.local()
        .startOf("day")
        .plus({ minutes: minuteOfDay + 55 })
        .toSQL(),
      vehicleId
    });
    await insertBusStopVisit({
      avlId: currentAvlId,
      busStopId: nonTerminalBusStopId
    });

    const actual = await getTripIdFromVehicleId(vehicleId);
    const expected = tripId;

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
