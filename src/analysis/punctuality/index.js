// @flow

import "../../service/config";

import { cleanData, createTempTable, dropTable } from "./data";

import { plotTimetable } from "./plot";

main();

async function main() {
  // await dropTable();
  // await createTempTable();
  // await cleanData();

  plotTimetable();
}
