// @flow

import { clearTables, randomId } from "../../__test/testUtils";

import database from "../../database/database";
import { getAllVehicles } from "../VehicleResolver";
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

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
