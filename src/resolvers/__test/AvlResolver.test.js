// @flow

import {
  getAvlFromAvlId,
  getAvlOfLastTerminalExitFromVehicleId,
  getAvlsFromDate
} from "../AvlResolver";
import {
  insertAvl,
  insertBusStop,
  insertBusStopVisit,
  insertVehicle
} from "../../__test/insert";

import { DateTime } from "luxon";
import busStops from "../../__test/models/busStops";
import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";

describe("avl resolver", () => {
  test.only("gets avls from date", async () => {
    const timestamp = DateTime.local()
      .minus({ days: 5 })
      .startOf("day");
    const avl = [
      await insertAvl({
        id: 1,
        timestamp: timestamp.plus({ hours: 6 }).toSQL()
      }),
      await insertAvl({
        id: 2,
        timestamp: timestamp.plus({ hours: 12 }).toSQL()
      }),
      await insertAvl({
        id: 3,
        timestamp: timestamp.plus({ hours: 18 }).toSQL()
      })
    ];

    const actual = await getAvlsFromDate(undefined, { date: timestamp });
    const expected = avl;

    expect(actual).toEqual(expected);
  });

  test("gets avl of last terminal exit from vehicle id", async () => {
    const vehicleId = 8;
    const lastTerminalAvlId = 10;
    const currentAvlId = 500;
    const terminal = busStops.begbrokeSciencePark;
    const nonTerminal = busStops.oxfordTownCentre;

    await insertVehicle({ id: vehicleId });
    for (let i = 0; i < 100; i++) {
      await insertAvl({ id: lastTerminalAvlId + i, vehicleId });
    }
    await insertBusStop(terminal);
    await insertBusStop(nonTerminal);
    await insertBusStopVisit({
      avlId: lastTerminalAvlId,
      busStopId: terminal.id
    });
    await insertBusStopVisit({
      avlId: lastTerminalAvlId + 50,
      busStopId: nonTerminal.id
    });

    const actual = await getAvlOfLastTerminalExitFromVehicleId(vehicleId);
    const expected = await getAvlFromAvlId(lastTerminalAvlId);

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
