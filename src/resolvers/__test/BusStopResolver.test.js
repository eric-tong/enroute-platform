// @flow

import busStops, { busStopsInTrip } from "../../__test/models/busStops";
import {
  getAllBusStops,
  getBusStopFromAvlId,
  getBusStopFromId,
  getBusStopFromUrl,
  getBusStopsFromTripId,
  getBusStopsVisitedByVehicle,
  getUpcomingBusStopsFromTripId
} from "../BusStopResolver";
import {
  insertAvl,
  insertBusStop,
  insertBusStopVisit,
  insertScheduledDeparture,
  insertVehicle
} from "../../__test/insert";

import { DateTime } from "luxon";
import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";

const tripId = 8;

describe("bus stop resolver", () => {
  test("gets all bus stops", async () => {
    for (const key of Object.keys(busStops)) {
      await insertBusStop(busStops[key]);
    }

    const actual = new Set(await getAllBusStops());
    const expected = new Set(Object.values(busStops));

    expect(actual).toEqual(expected);
  });

  test("gets bus stop from url", async () => {
    const oxfordTownCentre = busStops.oxfordTownCentre;
    await insertBusStop(oxfordTownCentre);

    const actual = await getBusStopFromUrl(undefined, {
      url: oxfordTownCentre.url
    });
    const expected = oxfordTownCentre;

    expect(actual).toEqual(expected);
  });

  test("gets bus stop from id", async () => {
    const oxfordTownCentre = busStops.oxfordTownCentre;
    await insertBusStop(oxfordTownCentre);

    const actual = await getBusStopFromId(oxfordTownCentre.id);
    const expected = oxfordTownCentre;

    expect(actual).toEqual(expected);
  });

  test("gets bus stops from trip id", async () => {
    await insertTestTrip();

    const actual = await getBusStopsFromTripId(tripId);
    const expected = busStopsInTrip;

    expect(actual).toEqual(expected);
  });

  describe("gets upcoming bus stops from trip id", () => {
    test("no bus stops have been visited", async () => {
      await insertTestTrip();

      const actual = await getUpcomingBusStopsFromTripId(tripId, []);
      const expected = busStopsInTrip;

      expect(actual).toEqual(expected);
    });

    test("bus stops visited in order", async () => {
      await insertTestTrip();

      const actual = await getUpcomingBusStopsFromTripId(tripId, [7, 4, 5]);
      const expected = [
        busStops.departmentOfMaterialsNorthbound,
        busStops.bbcOxford,
        busStops.parkwayParkAndRideNorthbound,
        busStops.begbrokeSciencePark
      ];

      expect(actual).toEqual(expected);
    });

    test("bus stops skipped", async () => {
      await insertTestTrip();

      const actual = await getUpcomingBusStopsFromTripId(tripId, [7, 5]);
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

      await insertAvl({ id: avlId });
      await insertBusStop(busStop);
      await insertBusStopVisit({ avlId, busStopId: busStop.id });

      const actual = await getBusStopFromAvlId(avlId);
      const expected = busStop;

      expect(actual).toEqual(expected);
    });

    test("returns null when avl is not at a bus stup", async () => {
      const avlId = 88;
      const busStop = busStops.departmentOfMaterialsSouthbound;

      await insertAvl({ id: avlId });

      const actual = await getBusStopFromAvlId(avlId);
      const expected = null;

      expect(actual).toEqual(expected);
    });
  });

  test("get bus stops visited by vehicle", async () => {
    const vehicleId = 8;
    const busStopsVisited = [
      busStops.departmentOfMaterialsSouthbound,
      busStops.begbrokeSciencePark,
      busStops.departmentOfMaterialsNorthbound,
      busStops.bbcOxford,
      busStops.parkwayParkAndRideNorthbound
    ];

    await insertVehicle({ id: vehicleId });
    for (let i = 0; i < 100; i++) {
      await insertAvl({ id: i, vehicleId });
    }
    for (const busStop of busStopsVisited) {
      await insertBusStop(busStop);
    }
    for (let i = 0; i < busStopsVisited.length; i++) {
      await insertBusStopVisit({
        avlId: i * 5 + 1,
        busStopId: busStopsVisited[i].id
      });
    }

    const actual = await getBusStopsVisitedByVehicle(vehicleId);
    const expected = busStopsVisited.slice(1);

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});

async function insertTestTrip() {
  for (const key of Object.keys(busStops)) {
    await insertBusStop(busStops[key]);
  }
  for (let i = 0; i < busStopsInTrip.length; i++) {
    await insertScheduledDeparture({
      id: i,
      minuteOfDay: i,
      tripId,
      busStopId: busStopsInTrip[i].id
    });
  }
}
