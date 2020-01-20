// @flow

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} from "graphql";
import {
  checkOutWithId,
  createCheckIn,
  getDepartments
} from "../resolvers/checkIn";
import { getAvl, getLatestAvlOfVehicle } from "../resolvers/avl";
import { getBusStopFromUrl, getBusStops } from "../resolvers/busStops";

import { getDeparturesFromBusStop } from "../resolvers/departures";
import { getIoFromAvl } from "../resolvers/io";
import { getRouteCoords } from "../resolvers/routes";
import { getVehicles } from "../resolvers/vehicles";

const LocationInterface = new GraphQLInterfaceType({
  name: "LocationInterface",
  description: "Interface for objects with latitude and longitude values",
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat }
  }
});

const LocationType = new GraphQLObjectType({
  name: "LocationType",
  description: "Point with latitude and longitude values",
  interfaces: [LocationInterface],
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat }
  }
});

const IOType = new GraphQLObjectType({
  name: "IO",
  description: "IO elements data",
  fields: {
    name: { type: GraphQLString },
    value: { type: GraphQLInt }
  }
});

const AVLType = new GraphQLObjectType({
  name: "AVLType",
  description: "Automatic Vehicle Location data",
  interfaces: [LocationInterface],
  fields: {
    id: { type: GraphQLInt },
    priority: { type: GraphQLString },
    timestamp: { type: GraphQLString },
    altitude: { type: GraphQLInt },
    longitude: { type: GraphQLFloat },
    latitude: { type: GraphQLFloat },
    angle: { type: GraphQLInt },
    satellites: { type: GraphQLInt },
    speed: { type: GraphQLInt },
    vehicleId: { type: GraphQLInt },
    io: { type: new GraphQLList(IOType), resolve: getIoFromAvl }
  }
});

const DepartureType = new GraphQLObjectType({
  name: "DepartureType",
  description: "Scheduled and predicted departure times of the vehicle",
  fields: {
    scheduled: { type: GraphQLString },
    predicted: { type: GraphQLString }
  }
});

const VehicleType = new GraphQLObjectType({
  name: "VehicleType",
  description: "Vehicle id with timestamped coordinates",
  fields: {
    id: { type: GraphQLInt },
    registration: { type: GraphQLString },
    imei: { type: GraphQLString },
    avl: { type: AVLType, resolve: getLatestAvlOfVehicle }
  }
});

const BusStopType = new GraphQLObjectType({
  name: "BusStopType",
  description: "Bus stop with location",
  interfaces: [LocationInterface],
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    street: { type: GraphQLString },
    icon: { type: GraphQLString },
    url: { type: GraphQLString },
    direction: { type: GraphQLString },
    departures: {
      type: new GraphQLList(DepartureType),
      args: { maxLength: { type: GraphQLInt } },
      resolve: getDeparturesFromBusStop
    },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat }
  }
});

const DepartmentType = new GraphQLObjectType({
  name: "DepartmentType",
  description: "Deparment with name and id",
  fields: {
    name: { type: GraphQLString },
    type: { type: GraphQLString }
  }
});

const vehicles = {
  description: "Query for all vehicles",
  type: new GraphQLList(VehicleType),
  resolve: getVehicles
};

const busStops = {
  description: "Get bus stops and their locations",
  type: new GraphQLList(BusStopType),

  resolve: getBusStops
};

const busStop = {
  description: "Get one bus stop with its unique url",
  type: BusStopType,
  args: { url: { type: GraphQLString } },
  resolve: getBusStopFromUrl
};

const route = {
  description: "Get coordinates along route of bus",
  type: new GraphQLList(LocationType),
  resolve: getRouteCoords
};

const avls = {
  description: "Get AVL data",
  type: new GraphQLList(AVLType),
  args: {
    date: { type: GraphQLString },
    full: { type: GraphQLBoolean }
  },
  resolve: getAvl
};

const departments = {
  description: "Get departments",
  type: new GraphQLList(DepartmentType),
  resolve: getDepartments
};

const createNewCheckIn = {
  description: "Create a new check in instance",
  type: GraphQLInt,
  args: {
    departmentType: { type: GraphQLString },
    vehicleRegistration: { type: GraphQLString }
  },
  resolve: createCheckIn
};

const checkOut = {
  description: "Remove a check in instance",
  type: GraphQLInt,
  args: {
    id: { type: GraphQLInt }
  },
  resolve: checkOutWithId
};

const MutationType = new GraphQLObjectType({
  name: "MutationType",
  fields: { createNewCheckIn, checkOut }
});

const RootQueryType = new GraphQLObjectType({
  name: "RootQueryType",
  fields: { vehicles, busStops, busStop, route, avls, departments }
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: MutationType
});

export default schema;
