// @flow

import { clearTables } from "../../__test/testUtils";
import database from "../../database/database";
import { getAllDepartments } from "../DepartmentResolver";
import { insertDepartment } from "../../__test/insert";

describe("department resolver", () => {
  test("gets all departments", async () => {
    const departments = [
      await insertDepartment({ id: 100 }),
      await insertDepartment({ id: 200 }),
      await insertDepartment({ id: 300 }),
      await insertDepartment({ id: 400 })
    ];

    const actual = await getAllDepartments();
    const expected = departments;

    expect(actual).toEqual(expected);
  });

  beforeAll(clearTables);
  afterEach(clearTables);
  afterAll(() => database.end());
});
