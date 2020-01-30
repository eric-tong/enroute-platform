// @flow

import { Settings } from "luxon";
import path from "path";

Settings.defaultLocale = "en-GB";
Settings.defaultZoneName = "Europe/London";

require("dotenv").config({ path: path.resolve(process.cwd(), ".test.env") });
