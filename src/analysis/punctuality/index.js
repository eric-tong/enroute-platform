// @flow

import "../../service/config";

import { cleanData, createTempTable, dropTable } from "./data";

import plotEarlyCount from "./plotEarlyCount";
import plotMedianDeviation from "./plotMedianDeviation";
import plotSkipCount from "./plotSkipCount";

main();

async function main() {
  // await dropTable();
  // await createTempTable();
  // await cleanData();

  plotMedianDeviation();
  plotSkipCount();
  plotEarlyCount();
}
