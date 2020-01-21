// @flow

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from "graphql";

import { IoType } from "./IoSchema";
import { getAvl } from "../resolvers/AvlResolver";
import { getIoFromAvl } from "../resolvers/IoResolver";

export const AvlType = new GraphQLObjectType({
  name: "AVLType",
  description: "Automatic Vehicle Location data",
  fields: () => ({
    id: { type: GraphQLID },
    priority: { type: GraphQLString },
    timestamp: { type: GraphQLString },
    altitude: { type: GraphQLInt },
    longitude: { type: GraphQLFloat },
    latitude: { type: GraphQLFloat },
    angle: { type: GraphQLInt },
    satellites: { type: GraphQLInt },
    speed: { type: GraphQLInt },
    vehicleId: { type: GraphQLInt },
    io: { type: new GraphQLList(IoType), resolve: getIoFromAvl }
  })
});

export const AvlQuery = {
  description: "Get AVL data",
  type: new GraphQLList(AvlType),
  args: {
    date: { type: GraphQLString },
    full: { type: GraphQLBoolean }
  },
  resolve: getAvl
};
