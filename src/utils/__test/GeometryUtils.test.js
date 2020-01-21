// @flow

import { findParametricValueAtBoundary } from "../GeometryUtils";

describe("geometry utils", () => {
  test("finds distance to circled centered at origin", () => {
    const p1 = { x: 0, y: -1 };
    const p2 = { x: 3, y: 0 };
    const origin = { x: 0, y: 0 };
    const radius = 2;

    const actual = findParametricValueAtBoundary(p1, p2, origin, radius);
    const expected = 0.34322;

    expect(actual).toBeCloseTo(expected, 0.00001);
  });

  test("finds distance to arbitrary circle", () => {
    const p1 = { x: 6, y: 6 };
    const p2 = { x: 400, y: -400 };
    const origin = { x: 5, y: 5 };
    const radius = 6;

    const actual = findParametricValueAtBoundary(p1, p2, origin, radius);
    const expected = 0.98965;

    expect(actual).toBeCloseTo(expected, 0.00001);
  });
});
