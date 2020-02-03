// @flow

import {
  getBusStopVisitFromAvlId,
  insertBusStopVisitFromAvlId
} from "../BusStopVisitResolver";
import { insertAvl, insertBusStop } from "../../__test/insert";

import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";

describe("bus stop visit resolver", () => {
  describe("inserts bus stop visit from avl id", () => {
    test("inserts if close to terminal bus stop with no angle", async () => {
      const busStop = await insertBusStop({
        longitude: 100,
        latitude: 100
      });
      const avl = await insertAvl({
        longitude: 100.00001,
        latitude: 100.00001
      });
      await insertBusStopVisitFromAvlId(avl.id);

      const actual = await getBusStopVisitFromAvlId(avl.id);
      const expected: BusStopVisit = {
        avlId: avl.id,
        busStopId: busStop.id,
        scheduledDepartureId: null,
        isProxy: false
      };

      expect(actual).toEqual(expected);
    });
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
