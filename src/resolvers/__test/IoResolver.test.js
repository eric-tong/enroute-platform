// @flow

import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";
import { getIoFromAvlId } from "../IoResolver";
import { insertIo } from "../../__test/insert";

describe("check in resolver", () => {
  test("gets io from avl id", async () => {
    const avlId = 200;
    const io1 = { name: "ioName1", value: 500 };
    const io2 = { name: "ioName2", value: 500 };

    await insertIo(io1, avlId);
    await insertIo(io2, avlId);

    const actual = await getIoFromAvlId(avlId);
    const expected = [io1, io2];

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
