// @flow

import "../../service/config";

import { cleanData, createTempTable, dropTable } from "./data";

main();

async function main() {
  await dropTable();
  await createTempTable();
  await cleanData();
}
