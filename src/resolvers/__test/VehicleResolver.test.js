// @flow

import { clearTables, randomId } from "../../__test/testUtils";
import { getAllVehicles, imeiIsValid } from "../VehicleResolver";

import database from "../../database/database";
import { insertVehicle } from "../../__test/insert";

describe("vehicle resolver", () => {
  test("gets all vehicles", async () => {
    const vehicles = [
      await insertVehicle({ id: randomId() }),
      await insertVehicle({ id: randomId() }),
      await insertVehicle({ id: randomId() })
    ];

    const actual = await getAllVehicles();
    const expected = vehicles;

    expect(actual).toEqual(expected);
  });

  describe("checks if imei is valid", () => {
    test("returns true for valid imei", async () => {
      const imei = randomId().toString();
      await insertVehicle({ imei });

      const actual = await imeiIsValid(imei);
      const expected = true;

      expect(actual).toEqual(expected);
    });

    test("returns false for valid imei", async () => {
      const imei = randomId().toString();

      const actual = await imeiIsValid(imei);
      const expected = false;

      expect(actual).toEqual(expected);
    });
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
