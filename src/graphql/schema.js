// @flow

import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

import { getArrivalsFromBusStop } from "../resolvers/arrivals";
import { getAvlOfVehicle } from "../resolvers/avl";
import { getBusStops } from "../resolvers/busStops";
import { getRouteCoords } from "../resolvers/route";
import { getVehicle } from "../resolvers/vehicles";

const LocationInterface = new GraphQLInterfaceType({
  name: "LocationInterface",
  description: "Interface for objects with latitude and longitude values",
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
  },
});

const LocationType = new GraphQLObjectType({
  name: "LocationType",
  description: "Point with latitude and longitude values",
  interfaces: [LocationInterface],
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
  },
});

const AVLType = new GraphQLObjectType({
  name: "AVLType",
  description: "Automatic Vehicle Location data",
  fields: {
    timestamp: { type: GraphQLString },
    longitude: { type: GraphQLFloat },
    latitude: { type: GraphQLFloat },
    angle: { type: GraphQLInt },
    speed: { type: GraphQLInt },
  },
});

const VehicleType = new GraphQLObjectType({
  name: "VehicleType",
  description: "Vehicle id with timestamped coordinates",
  fields: {
    id: { type: GraphQLInt },
    registration: { type: GraphQLString },
    imei: { type: GraphQLString },
    avl: { type: AVLType, resolve: getAvlOfVehicle },
  },
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
    arrivals: {
      type: new GraphQLList(GraphQLString),
      args: { maxLength: { type: GraphQLInt } },
      resolve: getArrivalsFromBusStop,
    },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
  },
});

const vehicles = {
  description: "Query for all vehicles",
  type: new GraphQLList(VehicleType),
  resolve: getVehicle,
};

const busStops = {
  description: "Get bus stops and their locations",
  type: new GraphQLList(BusStopType),
  resolve: getBusStops,
};

const route = {
  description: "Get coordinates along route of bus",
  type: new GraphQLList(LocationType),
  resolve: getRouteCoords,
};

const RootQueryType = new GraphQLObjectType({
  name: "RootQueryType",
  fields: { vehicles, busStops, route },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
});

export default schema;
