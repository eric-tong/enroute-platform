// @flow

import busStops from "../../__test/models/busStops";
import { downloadDirections } from "../MapboxUtils";

describe("mapbox utils", () => {
  test("downloads route", async () => {
    const busStopsInRoute = [
      busStops.begbrokeSciencePark,
      busStops.departmentOfMaterialsSouthbound,
      busStops.oxfordTownCentre,
      busStops.begbrokeSciencePark
    ];

    const actual = await downloadDirections(busStopsInRoute);

    expect(actual.legs.length).toEqual(busStopsInRoute.length - 1);
    expect(actual.geometry.coordinates.length).toBeGreaterThan(0);
  });
});
