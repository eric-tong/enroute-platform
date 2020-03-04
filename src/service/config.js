// @flow

import { Settings } from "luxon";

Settings.defaultLocale = "en-GB";
Settings.defaultZoneName = "Europe/London";

require("dotenv").config();

const Sentry = require("@sentry/node");
Sentry.init({
  dsn: "https://f2d6b12152264913bb31cf0b22985e85@sentry.io/3663179"
});
