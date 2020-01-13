// @flow

import NodeCache from "node-cache";
import { Settings } from "luxon";

Settings.defaultLocale = "en-GB";
Settings.defaultZoneName = "Europe/London";

require("dotenv").config();

export const vehicleStatusCache = new NodeCache();
