// @flow

import database from "../../database/database";
import { getGlobalState } from "../globalState";
import path from "path";

let globalState;

describe("global state", () => {
  test("trip ids of vehicles do not repeat", async () => {
    const tripIds = globalState.vehicleStates.map(
      vehicleState => vehicleState.trip.id
    );
  });

  beforeAll(async () => {
    // $FlowFixMe this is a hack to temporarily use the main database instead of the test one
    database.options.database = process.env.DATABASE_NAME.split("_")[0];
    globalState = await getGlobalState();
    console.log(globalState.vehicleStates);
  });
  afterAll(() => {
    // $FlowFixMe reset database to the test database
    database.options.database = process.env.DATABASE_NAME;
    database.end();
  });
});
