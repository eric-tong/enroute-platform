// @flow

import { clearTables, randomId } from "../../__test/testUtils";
import {
  getBusStopVisitFromAvlId,
  insertBusStopVisitFromAvl
} from "../BusStopVisitResolver";
import {
  insertAvl,
  insertAvlTrip,
  insertBusStop,
  insertBusStopVisit,
  insertScheduledDeparture
} from "../../__test/insert";

import { DateTime } from "luxon";
import database from "../../database/database";

describe("bus stop visit resolver", () => {
  describe("inserts bus stop visit from avl id", () => {
    test("without scheduled departure", async () => {
      const tripId = randomId();
      const busStop = await insertBusStop({
        longitude: 100,
        latitude: 100
      });
      const avl = await insertAvl({
        longitude: 100.00001,
        latitude: 100.00001
      });
      await insertAvlTrip({ avlId: avl.id });
      await insertBusStopVisitFromAvl(avl);

      const actual = await getBusStopVisitFromAvlId(avl.id);
      const expected: BusStopVisit = {
        avlId: avl.id,
        busStopId: busStop.id,
        scheduledDepartureId: null,
        isProxy: false
      };

      expect(actual).toEqual(expected);
    });

    test("with scheduled departure", async () => {
      const tripId = randomId();
      const busStop = await insertBusStop({
        longitude: 100,
        latitude: 100
      });
      const avl = await insertAvl({
        longitude: 100.00001,
        latitude: 100.00001
      });
      const scheduledDeparture = await insertScheduledDeparture({
        tripId,
        busStopId: busStop.id
      });
      await insertAvlTrip({ avlId: avl.id, tripId });
      await insertBusStopVisitFromAvl(avl);

      const actual = await getBusStopVisitFromAvlId(avl.id);
      const expected: BusStopVisit = {
        avlId: avl.id,
        busStopId: busStop.id,
        scheduledDepartureId: scheduledDeparture.id,
        isProxy: false
      };

      expect(actual).toEqual(expected);
    });
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
