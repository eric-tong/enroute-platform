// @flow

import { allBusStops, oxfordTownCentre } from "../../__test/models/BusStops";
import {
  getAllBusStops,
  getBusStopFromId,
  getBusStopFromUrl
} from "../BusStopResolver";

import database from "../../database/database";

describe("bus stop resolver", () => {
  test("gets all bus stops", async () => {
    const actual = await getAllBusStops();
    const expected = allBusStops;

    expect(actual).toEqual(expected);
  });

  test("gets bus stop from url", async () => {
    const actual = await getBusStopFromUrl(undefined, {
      url: oxfordTownCentre.url
    });
    const expected = oxfordTownCentre;

    expect(actual).toEqual(expected);
  });

  test("gets bus stop from id", async () => {
    const actual = await getBusStopFromId(oxfordTownCentre.id);
    const expected = oxfordTownCentre;

    expect(actual).toEqual(expected);
  });

  afterAll(() => database.end());
});
