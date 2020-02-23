// @flow

import { checkOutFromCheckInId, createCheckIn } from "../CheckInResolver";
import { clearTables, randomId } from "../../__test/testUtils";

import database from "../../database/database";
import { insertBusStop } from "../../__test/insert";

describe("check in resolver", () => {
  describe("creates new check in", () => {
    test.only("with valid bus stop", async () => {
      const userId = randomId();
      const origin = await insertBusStop({});
      const destination = await insertBusStop({});
      const remarks = "new remark";

      const actual = await createCheckIn(undefined, {
        userId,
        originId: origin.id,
        destinationId: destination.id,
        remarks
      });
      const expected = {
        id: expect.anything(),
        timestamp: expect.anything(),
        userId,
        originId: origin.id,
        destinationId: destination.id,
        remarks
      };

      expect(actual).toEqual(expected);
    });

    test("returns undefined with invalid department", async () => {
      const actual = await createCheckIn(undefined, {
        departmentType: "invalidDepartment",
        vehicleRegistration: vehicle.registration
      });

      expect(actual).toBeUndefined();
    });
  });

  describe("checks out", () => {
    test("with valid check in id", async () => {
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
