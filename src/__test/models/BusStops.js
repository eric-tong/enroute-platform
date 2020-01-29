// @flow

import type { BusStop } from "../../graphql/BusStopSchema";

const OxfordTownCentre: BusStop = {
  id: 5,
  name: "Oxford Town Centre",
  street: "Broad Street",
  icon: "T",
  longitude: -1.255659,
  latitude: 51.754564,
  direction: "Begbroke",
  url: "oxford-town-centre",
  roadAngle: 80
};

export const AllBusStops: BusStop[] = [
  OxfordTownCentre,
  {
    id: 2,
    name: "Department of Materials",
    street: "Parks Road",
    icon: "M",
    longitude: -1.259159,
    latitude: 51.760682,
    direction: "Begbroke",
    url: "department-of-materials-northbound",
    roadAngle: 320
  },
  {
    id: 8,
    name: "BBC Oxford",
    street: "Banbury Road",
    icon: "B",
    longitude: -1.265716,
    latitude: 51.779356,
    direction: "Begbroke",
    url: "bbc-oxford",
    roadAngle: 345
  },
  {
    id: 3,
    name: "Parkway Park & Ride",
    street: "Oxford Road",
    icon: "P",
    longitude: -1.274946,
    latitude: 51.802707,
    direction: "Begbroke",
    url: "parkway-park-and-ride-northbound",
    roadAngle: 335
  },
  {
    id: 7,
    name: "Begbroke Science Park",
    street: "Begbroke Lane",
    icon: "B",
    longitude: -1.306494,
    latitude: 51.81798,
    direction: "Town Centre",
    url: "begbroke-science-park",
    roadAngle: null
  },
  {
    id: 6,
    name: "Parkway Park & Ride",
    street: "Oxford Road",
    icon: "P",
    longitude: -1.274474,
    latitude: 51.802281,
    direction: "Town Centre",
    url: "parkway-park-and-ride-southbound",
    roadAngle: 155
  },
  {
    id: 1,
    name: "Summertown Shops",
    street: "Banbury Road",
    icon: "S",
    longitude: -1.264919,
    latitude: 51.777751,
    direction: "Town Centre",
    url: "summertown-shops",
    roadAngle: 165
  },
  {
    id: 4,
    name: "Department of Materials",
    street: "Parks Road",
    icon: "M",
    longitude: -1.258587,
    latitude: 51.760424,
    direction: "Town Centre",
    url: "department-of-materials-southbound",
    roadAngle: 140
  }
];
