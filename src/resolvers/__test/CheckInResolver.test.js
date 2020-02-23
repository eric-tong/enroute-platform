// @flow

import { checkOutFromCheckInId, createCheckIn } from "../CheckInResolver";
import { clearTables, randomId } from "../../__test/testUtils";

import database from "../../database/database";
import { insertBusStop } from "../../__test/insert";

describe("check in resolver", () => {
  test("creates new check in", async () => {
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

  describe("checks out", () => {
    test("with valid check in id", async () => {
      const userId = randomId();
      const origin = await insertBusStop({});
      const destination = await insertBusStop({});
      const remarks = "new remark";

      const checkIn = await createCheckIn(undefined, {
        userId,
        originId: origin.id,
        destinationId: destination.id,
        remarks
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
