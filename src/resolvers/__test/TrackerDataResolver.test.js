// @flow

import { clearTables, randomId } from "../../__test/testUtils";

import { DateTime } from "luxon";
import type { IOData } from "../../trackers/Codec8Schema";
import database from "../../database/database";
import { getAvlFromAvlId } from "../AvlResolver";
import { getIoFromAvlId } from "../IoResolver";
import { insertAvlFromTrackerData } from "../TrackerDataResolver";
import { insertIo } from "../../__test/insert";

describe("tracker data resolver", () => {
  test("insert data from tracker data", async () => {
    const avl: AVL = {
      id: randomId(),
      priority: "low",
      timestamp: DateTime.local().toSQL(),
      altitude: randomId(),
      longitude: randomId(),
      latitude: randomId(),
      angle: randomId(),
      satellites: randomId(10),
      speed: randomId(),
      vehicleId: randomId()
    };

    const avlId = await insertAvlFromTrackerData(
      {
        timestamp: DateTime.fromSQL(avl.timestamp),
        priority: avl.priority,
        longitude: avl.longitude,
        latitude: avl.latitude,
        altitude: avl.altitude,
        angle: avl.angle,
        satellites: avl.satellites,
        speed: avl.speed,
        eventIOId: 0,
        totalIOCount: 0,
        oneByteIOCount: 0,
        oneByteIOData: [],
        twoByteIOCount: 0,
        twoByteIOData: [],
        fourByteIOCount: 0,
        fourByteIOData: [],
        eightByteIOCount: 0,
        eightByteIOData: []
      },
      avl.vehicleId
    );

    const actual = await getAvlFromAvlId(avlId);
    const expected = avl;

    expect(actual.altitude).toEqual(expected.altitude);
    expect(actual.angle).toEqual(expected.angle);
    expect(actual.latitude).toEqual(expected.latitude);
    expect(actual.longitude).toEqual(expected.longitude);
    expect(actual.priority).toEqual(expected.priority);
    expect(actual.satellites).toEqual(expected.satellites);
    expect(actual.speed).toEqual(expected.speed);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
