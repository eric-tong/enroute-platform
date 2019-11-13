// @flow

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
} from "graphql";
import { getVehicle } from "./simulator";

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

const RootQueryType = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    vehicle: {
      description: "Query for one vehicle using its id",
      type: VehicleType,
      resolve: getVehicle,
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
});

export default schema;
