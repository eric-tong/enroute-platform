// @flow

import { clearTables, randomId } from "../../__test/testUtils";
import {
  insertAvl,
  insertAvlTrip,
  insertBusStop,
  insertBusStopVisit,
  insertPredictedDeparture,
  insertScheduledDeparture
} from "../../__test/insert";

import database from "../../database/database";
import { getDepartureFromScheduledDeparture } from "../DepartureResolver";

describe("departure resolver", () => {
  test("gets departure from scheduled departure", async () => {
    const avlId = randomId();
    const busStop = await insertBusStop({});
    const scheduledDeparture = await insertScheduledDeparture({
      busStopId: busStop.id
    });
    const predictedDeparture = await insertPredictedDeparture({
      scheduledDepartureId: scheduledDeparture.id,
      avlId
    });
    const actualDeparture = await insertAvl({ id: avlId });
    await insertBusStopVisit({
      avlId,
      busStopId: busStop.id,
      scheduledDepartureId: scheduledDeparture.id
    });

    await insertAvlTrip({ avlId, tripId: scheduledDeparture.tripId });

    const actual = await getDepartureFromScheduledDeparture(scheduledDeparture);
    const expected: Departure = {
      scheduledDeparture,
      predictedDeparture,
      actualDeparture,
      status: "now"
    };

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
