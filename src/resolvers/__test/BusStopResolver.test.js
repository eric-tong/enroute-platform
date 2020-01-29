// @flow

import { AllBusStops } from "../../__test/models/BusStops";
import database from "../../database/database";
import { getAllBusStops } from "../BusStopResolver";

describe("bus stop resolver", () => {
  test("gets all bus stops", async () => {
    const actual = await getAllBusStops();
    expect(actual).toEqual(AllBusStops);
  });

  afterAll(() => database.end());
});
