// @flow

import {
  getAvlFromAvlId,
  getAvlOfLastTerminalExitFromVehicleId,
  getAvlsFromDate,
  getLatestAvlFromVehicleId
} from "../AvlResolver";
import {
  insertAvl,
  insertBusStop,
  insertBusStopVisit,
  insertDepartment,
  insertVehicle
} from "../../__test/insert";

import { DateTime } from "luxon";
import busStops from "../../__test/models/busStops";
import { clearTables } from "../../__test/testUtils";
import { createCheckIn } from "../CheckInResolver";
import database from "../../database/database";

describe("check in resolver", () => {
  test("creates new check in", async () => {
    const vehicle = await insertVehicle({ registration: "XXXXXXX" });
    const department = await insertDepartment({
      id: 200,
      type: "newDepartment"
    });

    const actual = await createCheckIn(undefined, {
      departmentType: department.type,
      vehicleRegistration: vehicle.registration
    });
    const expected: CheckIn = {
      id: expect.anything(),
      timestamp: expect.anything(),
      departmentId: department.id,
      vehicleId: vehicle.id
    };

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
