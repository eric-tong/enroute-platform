// @flow

import "../../service/config";

import { cleanData, createTempTable, dropTable } from "./data";

import plotEarlyCount from "./plotEarlyCount";
import plotMedianDeviation from "./plotMedianDeviation";
import plotSkipCount from "./plotSkipCount";
import plotStandardDeviation from "./plotStandardDeviation";

main();

async function main() {
  // await dropTable();
  // await createTempTable();
  // await cleanData();

  plotMedianDeviation();
  plotStandardDeviation();
  plotSkipCount();
  plotEarlyCount();
}
