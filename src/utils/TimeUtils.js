// @flow

import { DateTime } from "luxon";

export function toActualTime(minuteOfDay: number) {
  return DateTime.local()
    .startOf("day")
    .plus({ minute: minuteOfDay });
}
