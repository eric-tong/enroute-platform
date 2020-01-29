// @flow

import {
  getAllBusStops,
  getBusStopFromAvlId,
  getBusStopFromId,
  getBusStopFromUrl,
  getBusStopsFromTripId,
  getUpcomingBusStopsFromTripId
} from "../BusStopResolver";

import { DateTime } from "luxon";
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

  describe("gets upcoming bus stops from trip id", () => {
    test("no bus stops have been visited", async () => {
      const actual = await getUpcomingBusStopsFromTripId(8, []);
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

    test("bus stops visited in order", async () => {
      const actual = await getUpcomingBusStopsFromTripId(8, [7, 4, 5]);
      const expected = [
        busStops.departmentOfMaterialsNorthbound,
        busStops.bbcOxford,
        busStops.parkwayParkAndRideNorthbound,
        busStops.begbrokeSciencePark
      ];

      expect(actual).toEqual(expected);
    });

    test("bus stops skipped", async () => {
      const actual = await getUpcomingBusStopsFromTripId(8, [7, 5]);
      const expected = [
        busStops.departmentOfMaterialsNorthbound,
        busStops.bbcOxford,
        busStops.parkwayParkAndRideNorthbound,
        busStops.begbrokeSciencePark
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe("get bus stop from avl id", () => {
    test("avl has a corresponding bus stop visit", async () => {
      const avlId = 1;
      const busStop = busStops.departmentOfMaterialsSouthbound;

      await database.query("INSERT INTO avl (id) VALUES ($1)", [avlId]);
      await database.query(
        "INSERT INTO bus_stop_visits (avl_id, bus_stop_id) VALUES ($1, $2)",
        [avlId, busStop.id]
      );

      const actual = await getBusStopFromAvlId(avlId);
      const expected = busStop;

      expect(actual).toEqual(expected);
    });
  });

  beforeAll(async () => {
    await database.query("CREATE TEMP TABLE avl AS TABLE avl WITH NO DATA");
    await database.query(
      "CREATE TEMP TABLE bus_stop_visits AS TABLE bus_stop_visits WITH NO DATA"
    );
  });

  afterAll(() => database.end());
});
