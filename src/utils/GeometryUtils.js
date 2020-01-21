// @flow

export type Point = { x: number, y: number };

// This function finds the intersection between a circle and a line
// between p1 and p2, where only one of the points is inside the circle.
// It returns the parametric value which defines the point of intersection.
export function findParametricValueAtBoundary(
  p1: Point,
  p2: Point,
  centre: Point,
  radius: number
) {
  // Transpose points to origin
  const x1 = p1.x - centre.x;
  const x2 = p2.x - centre.x;
  const y1 = p1.y - centre.y;
  const y2 = p2.y - centre.y;

  // Set up quadratic equation
  const a = sq(x1) + sq(x2) - 2 * x1 * x2 + sq(y1) + sq(y2) - 2 * y1 * y2;
  const b = 2 * x1 * x2 - 2 * sq(x2) + 2 * y1 * y2 - 2 * sq(y2);
  const c = sq(x2) + sq(y2) - sq(radius);

  const solutions = [
    (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a),
    (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a)
  ];

  return solutions.find(solution => solution < 1) ?? 0.5;
}

function distance(p1: Point, p2: Point) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function sq(n: number) {
  return n * n;
}
