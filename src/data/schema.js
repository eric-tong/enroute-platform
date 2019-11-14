// @flow

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
} from "graphql";
import { getVehicle } from "./vehicles";
import { getBusStops } from "./busStops";

const CoordsType = new GraphQLObjectType({
  name: "CoordsType",
  description: "Coordinates with x and y values",
  fields: {
    x: { type: GraphQLFloat },
    y: { type: GraphQLFloat },
  },
});

const VehicleType = new GraphQLObjectType({
  name: "VehicleType",
  description: "Vehicle id with timestamped coordinates",
  fields: {
    timestamp: { type: GraphQLString },
    coords: { type: CoordsType },
  },
});

const BusStopType = new GraphQLObjectType({
  name: "BusStopType",
  description: "Bus stop with location",
  fields: {
    name: { type: GraphQLString },
    street: { type: GraphQLString },
    icon: { type: GraphQLString },
    coords: { type: CoordsType },
  },
});

const vehicle = {
  description: "Query for one vehicle using its id",
  type: VehicleType,
  resolve: getVehicle,
};

const busStops = {
  description: "Get bus stops and their locations",
  type: new GraphQLList(BusStopType),
  resolve: getBusStops,
};

const RootQueryType = new GraphQLObjectType({
  name: "RootQueryType",
  fields: { vehicle, busStops },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
});

export default schema;
