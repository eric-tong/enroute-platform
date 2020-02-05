// @flow

import { DateTime } from "luxon";

export function toActualTime(minuteOfDay: number) {
  return DateTime.local()
    .startOf("day")
    .plus({ minute: minuteOfDay });
}

export function maxTime(t1: DateTime, t2: DateTime) {
  return t1.valueOf() > t2.valueOf() ? t1 : t2;
}
