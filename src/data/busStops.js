// @flow
import type { Coordinates } from "./DataTypes.flow";

type BusStop = {|
  name: string,
  street: string,
  coords: Coordinates,
  icon: string,
|};

const busStops: BusStop[] = [
  {
    name: "Begbroke Science Park",
    street: "Begbroke Lane",
    icon: "A",
    coords: { x: 51.81811946797804, y: -1.3066886590125932 },
  },
  {
    name: "BBC Oxford",
    street: "Banbury Road",
    icon: "B",
    coords: { x: 51.77928400000001, y: -1.2656560000000001 },
  },
  {
    name: "Department of Materials",
    street: "Parks Road",
    icon: "C",
    coords: { x: 51.76010073596463, y: -1.2582452109397764 },
  },
  {
    name: "Oxford Town Centre",
    street: "Broad Street",
    icon: "D",
    coords: { x: 51.75453480503126, y: -1.2556090514719926 },
  },
];

export function getBusStops() {
  return busStops;
}