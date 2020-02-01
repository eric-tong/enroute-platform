// @flow

import { clearTables, randomId } from "../../__test/testUtils";
import {
  insertAvl,
  insertPredictedDeparture,
  insertScheduledDeparture
} from "../../__test/insert";

import database from "../../database/database";
import { getPredictedDepartureTodayFromScheduledDepartureId } from "../PredictedDepartureResolver";

describe("predicted departures", () => {
  test("gets predicted departures today from scheduled departure id", async () => {
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

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
