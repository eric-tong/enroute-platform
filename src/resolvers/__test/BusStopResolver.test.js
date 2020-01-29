// @flow

import {
  getAllBusStops,
  getBusStopFromId,
  getBusStopFromUrl,
  getBusStopsFromTripId
} from "../BusStopResolver";

import busStops from "../../__test/models/busStops";
import database from "../../database/database";

describe("bus stop resolver", () => {
  test("gets all bus stops", async () => {
    const actual = new Set(await getAllBusStops());
    const expected = new Set(Object.values(busStops));

    expect(actual).toEqual(expected);
  });

  test("gets bus stop from url", async () => {
    const oxfordTownCentre = busStops.oxfordTownCentre;

    const actual = await getBusStopFromUrl(undefined, {
      url: oxfordTownCentre.url
    });
    const expected = oxfordTownCentre;

    expect(actual).toEqual(expected);
  });

  test("gets bus stop from id", async () => {
    const oxfordTownCentre = busStops.oxfordTownCentre;

    const actual = await getBusStopFromId(oxfordTownCentre.id);
    const expected = oxfordTownCentre;

    expect(actual).toEqual(expected);
  });

  test("gets bus stop from trip id", async () => {
    const actual = await getBusStopsFromTripId(8);
    const expected = [
      busStops.begbrokeSciencePark,
      busStops.departmentOfMaterialsSouthbound,
      busStops.oxfordTownCentre,
      busStops.departmentOfMaterialsNorthbound,
      busStops.bbcOxford,
      busStops.parkwayParkAndRideNorthbound,
      busStops.begbrokeSciencePark
    ];

    expect(actual).toEqual(expected);
  });

  afterAll(() => database.end());
});
