// @flow

const busStops: { [string]: BusStop } = {
  oxfordTownCentre: {
    id: 5,
    name: "Oxford Town Centre",
    street: "Broad Street",
    icon: "T",
    longitude: -1.255659,
    latitude: 51.754564,
    direction: "Begbroke",
    url: "oxford-town-centre",
    roadAngle: 80,
    isTerminal: false
  },
  departmentOfMaterialsNorthbound: {
    id: 2,
    name: "Department of Materials",
    street: "Parks Road",
    icon: "M",
    longitude: -1.259159,
    latitude: 51.760682,
    direction: "Begbroke",
    url: "department-of-materials-northbound",
    roadAngle: 320,
    isTerminal: false
  },
  bbcOxford: {
    id: 8,
    name: "BBC Oxford",
    street: "Banbury Road",
    icon: "B",
    longitude: -1.265716,
    latitude: 51.779356,
    direction: "Begbroke",
    url: "bbc-oxford",
    roadAngle: 345,
    isTerminal: false
  },
  parkwayParkAndRideNorthbound: {
    id: 3,
    name: "Parkway Park & Ride",
    street: "Oxford Road",
    icon: "P",
    longitude: -1.274946,
    latitude: 51.802707,
    direction: "Begbroke",
    url: "parkway-park-and-ride-northbound",
    roadAngle: 335,
    isTerminal: false
  },
  begbrokeSciencePark: {
    id: 7,
    name: "Begbroke Science Park",
    street: "Begbroke Lane",
    icon: "B",
    longitude: -1.306494,
    latitude: 51.81798,
    direction: "Town Centre",
    url: "begbroke-science-park",
    roadAngle: null,
    isTerminal: true
  },
  parkwayParkAndRideSouthbound: {
    id: 6,
    name: "Parkway Park & Ride",
    street: "Oxford Road",
    icon: "P",
    longitude: -1.274474,
    latitude: 51.802281,
    direction: "Town Centre",
    url: "parkway-park-and-ride-southbound",
    roadAngle: 155,
    isTerminal: false
  },
  summertownShops: {
    id: 1,
    name: "Summertown Shops",
    street: "Banbury Road",
    icon: "S",
    longitude: -1.264919,
    latitude: 51.777751,
    direction: "Town Centre",
    url: "summertown-shops",
    roadAngle: 165,
    isTerminal: false
  },
  departmentOfMaterialsSouthbound: {
    id: 4,
    name: "Department of Materials",
    street: "Parks Road",
    icon: "M",
    longitude: -1.258587,
    latitude: 51.760424,
    direction: "Town Centre",
    url: "department-of-materials-southbound",
    roadAngle: 140,
    isTerminal: false
  }
};

export const busStopsInTrip = [
  busStops.begbrokeSciencePark,
  busStops.departmentOfMaterialsSouthbound,
  busStops.oxfordTownCentre,
  busStops.departmentOfMaterialsNorthbound,
  busStops.bbcOxford,
  busStops.parkwayParkAndRideNorthbound,
  busStops.begbrokeSciencePark
];

export default busStops;
