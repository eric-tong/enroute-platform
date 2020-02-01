// @flow

import { clearTables, randomId } from "../../__test/testUtils";
import {
  insertAvl,
  insertPredictedDeparture,
  insertScheduledDeparture
} from "../../__test/insert";

import { DateTime } from "luxon";
import database from "../../database/database";
import { getPredictedDepartureTodayFromScheduledDepartureId } from "../PredictedDepartureResolver";

describe("predicted departures", () => {
  describe("gets predicted departures today from scheduled departure id", () => {
    test("predicted departure for today exists", async () => {
      const scheduledDepartureId = randomId();
      const avlId = randomId();

      await insertScheduledDeparture({ id: scheduledDepartureId });
      await insertAvl({ id: avlId });
      const predictedDeparture = await insertPredictedDeparture({
        avlId,
        scheduledDepartureId
      });

      const actual = await getPredictedDepartureTodayFromScheduledDepartureId(
        scheduledDepartureId
      );
      const expected = predictedDeparture;

      expect(actual).toEqual(expected);
    });

    test("returns undefined when predicted departure for today does not exist", async () => {
      const scheduledDepartureId = randomId();
      const avlId = randomId();

      await insertScheduledDeparture({ id: scheduledDepartureId });
      await insertAvl({ id: avlId });
      const predictedDeparture = await insertPredictedDeparture({
        avlId,
        scheduledDepartureId,
        predictedTimestamp: DateTime.local()
          .minus({ day: 1 })
          .toSQL()
      });

      const actual = await getPredictedDepartureTodayFromScheduledDepartureId(
        scheduledDepartureId
      );
      const expected = predictedDeparture;

      expect(actual).toBeUndefined();
    });
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
