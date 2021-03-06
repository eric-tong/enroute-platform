// @flow

import busStops, { busStopsInTrip } from "../../__test/models/busStops";
import { clearTables, randomId } from "../../__test/testUtils";
import {
  getAllBusStops,
  getBusStopFromAvlId,
  getBusStopFromId,
  getBusStopFromUrl,
  getBusStopsFromTripId,
  getBusStopsVisitedTodayFromTripId,
  getNearbyBusStopsFromLocation,
  getUpcomingBusStopsFromTripId
} from "../BusStopResolver";
import {
  insertAvl,
  insertBusStop,
  insertBusStopProxy,
  insertBusStopVisit,
  insertScheduledDeparture,
  insertVehicle
} from "../../__test/insert";

import { DateTime } from "luxon";
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
      const expected = busStopsInTrip.slice(1); // Already departed from first stop

      expect(actual).toEqual(expected);
    });

    test("bus stops visited in order", async () => {
      await insertTestTrip();

      const actual = await getUpcomingBusStopsFromTripId(tripId, [4, 5]);
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

      const actual = await getUpcomingBusStopsFromTripId(tripId, [5]);
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
    const tripId = randomId();
    const busStopsVisited = [];

    for (let i = 0; i < 10; i++) {
      const busStop = await insertBusStop({});
      const scheduledDeparture = await insertScheduledDeparture({
        tripId,
        busStopId: busStop.id
      });
      const avl = await insertAvl({});
      await insertBusStopVisit({
        avlId: avl.id,
        busStopId: busStop.id,
        scheduledDepartureId: scheduledDeparture.id
      });
      busStopsVisited.push(busStop);
    }

    const actual = await getBusStopsVisitedTodayFromTripId(tripId);
    const expected = busStopsVisited;

    expect(actual).toEqual(expected);
  });

  describe("get nearby bus stops from location", () => {
    test("returns nearby bus stop with any angle", async () => {
      const busStop = await insertBusStop({
        longitude: 100,
        latitude: 100
      });
      const avl = await insertAvl({
        longitude: 100.00001,
        latitude: 100.00001,
        angle: 0
      });

      const actual = await getNearbyBusStopsFromLocation(
        avl.longitude,
        avl.latitude,
        avl.angle
      );
      const expected = [{ busStop, isProxy: false }];

      expect(actual).toEqual(expected);
    });

    test("returns nearby bus stop with angle range", async () => {
      const busStop = await insertBusStop({
        longitude: 100,
        latitude: 100,
        roadAngle: 45
      });
      const avl = await insertAvl({
        longitude: 100.00001,
        latitude: 100.00001,
        angle: 85
      });

      const actual = await getNearbyBusStopsFromLocation(
        avl.longitude,
        avl.latitude,
        avl.angle
      );
      const expected = [{ busStop, isProxy: false }];

      expect(actual).toEqual(expected);
    });

    test("does not return far away bus stop", async () => {
      const busStop = await insertBusStop({
        longitude: 100,
        latitude: 100
      });
      const avl = await insertAvl({
        longitude: 101,
        latitude: 101,
        angle: 0
      });

      const actual = await getNearbyBusStopsFromLocation(
        avl.longitude,
        avl.latitude,
        avl.angle
      );
      const expected = [];

      expect(actual).toEqual(expected);
    });

    test("does not return bus stop with very different angle", async () => {
      const busStop = await insertBusStop({
        longitude: 100,
        latitude: 100,
        roadAngle: 180
      });
      const avl = await insertAvl({
        longitude: 100.001,
        latitude: 100.001,
        angle: 0
      });

      const actual = await getNearbyBusStopsFromLocation(
        avl.longitude,
        avl.latitude,
        avl.angle
      );
      const expected = [];

      expect(actual).toEqual(expected);
    });
  });

  describe("get nearby bus stop proxies from location", () => {
    test("returns nearby bus stop proxy with any angle", async () => {
      const busStop = await insertBusStop({
        longitude: 0,
        latitude: 0
      });
      const avl = await insertAvl({
        longitude: 100.00001,
        latitude: 100.00001,
        angle: 0
      });
      await insertBusStopProxy({
        busStopId: busStop.id,
        longitude: 100,
        latitude: 100
      });

      const actual = await getNearbyBusStopsFromLocation(
        avl.longitude,
        avl.latitude,
        avl.angle
      );
      const expected = [
        {
          busStop: { ...busStop, longitude: 100, latitude: 100 },
          isProxy: true
        }
      ];

      expect(actual).toEqual(expected);
    });

    test("returns nearby bus stop proxy with angle range", async () => {
      const busStop = await insertBusStop({
        longitude: 0,
        latitude: 0
      });
      const avl = await insertAvl({
        longitude: 100.00001,
        latitude: 100.00001,
        angle: 85
      });
      await insertBusStopProxy({
        busStopId: busStop.id,
        longitude: 100,
        latitude: 100,
        roadAngle: 45
      });

      const actual = await getNearbyBusStopsFromLocation(
        avl.longitude,
        avl.latitude,
        avl.angle
      );
      const expected = [
        {
          busStop: { ...busStop, longitude: 100, latitude: 100 },
          isProxy: true
        }
      ];

      expect(actual).toEqual(expected);
    });

    test("does not return far away bus stop proxy", async () => {
      const busStop = await insertBusStop({
        longitude: 0,
        latitude: 0
      });
      const avl = await insertAvl({
        longitude: 101,
        latitude: 101,
        angle: 0
      });
      await insertBusStopProxy({
        busStopId: busStop.id,
        longitude: 100,
        latitude: 100
      });

      const actual = await getNearbyBusStopsFromLocation(
        avl.longitude,
        avl.latitude,
        avl.angle
      );
      const expected = [];

      expect(actual).toEqual(expected);
    });

    test("does not return bus stop proxy with very different angle", async () => {
      const busStop = await insertBusStop({
        longitude: 0,
        latitude: 0
      });
      const avl = await insertAvl({
        longitude: 100.001,
        latitude: 100.001,
        angle: 0
      });
      await insertBusStopProxy({
        busStopId: busStop.id,
        longitude: 100,
        latitude: 100,
        roadAngle: 180
      });

      const actual = await getNearbyBusStopsFromLocation(
        avl.longitude,
        avl.latitude,
        avl.angle
      );
      const expected = [];

      expect(actual).toEqual(expected);
    });
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
    await insertScheduledDeparture(
      ({
        id: i,
        minuteOfDay: i,
        tripId,
        busStopId: busStopsInTrip[i].id
      }: ScheduledDeparture)
    );
  }
}
