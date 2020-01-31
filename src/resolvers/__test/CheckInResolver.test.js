// @flow

import { checkOutFromCheckInId, createCheckIn } from "../CheckInResolver";
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
import database from "../../database/database";

describe("check in resolver", () => {
  describe("creates new check in", () => {
    test("with valid department", async () => {
      const vehicle = await insertVehicle({ registration: "XXXXXXX" });
      const department = await insertDepartment({
        id: 200,
        type: "newDepartment"
      });

      const actual = await createCheckIn(undefined, {
        departmentType: department.type,
        vehicleRegistration: vehicle.registration
      });
      const expected = {
        id: expect.anything(),
        timestamp: expect.anything(),
        departmentId: department.id,
        vehicleId: vehicle.id
      };

      expect(actual).toEqual(expected);
    });

    test("returns undefined with invalid department", async () => {
      const vehicle = await insertVehicle({ registration: "XXXXXXX" });

      const actual = await createCheckIn(undefined, {
        departmentType: "invalidDepartment",
        vehicleRegistration: vehicle.registration
      });

      expect(actual).toBeUndefined();
    });
  });

  describe("checks out", () => {
    test("with valid check in id", async () => {
      const vehicle = await insertVehicle({ registration: "XXXXXXX" });
      const department = await insertDepartment({
        id: 200,
        type: "newDepartment"
      });
      const checkIn = await createCheckIn(undefined, {
        departmentType: department.type,
        vehicleRegistration: vehicle.registration
      });

      const actual = await checkOutFromCheckInId(undefined, { id: checkIn.id });
      const expected = checkIn;

      expect(actual).toEqual(expected);
    });

    test("returns undefined with invalid check in id", async () => {
      const actual = await checkOutFromCheckInId(undefined, { id: 500 });

      expect(actual).toBeUndefined();
    });
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
