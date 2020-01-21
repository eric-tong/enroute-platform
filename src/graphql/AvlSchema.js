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

import type { IO } from "./IoSchema";
import { IoType } from "./IoSchema";
import { getAllAvlsFromDate } from "../resolvers/AvlResolver";
import { getIoFromAvlId } from "../resolvers/IoResolver";

export type AVL = {|
  id: number,
  priority: string,
  timestamp: number,
  altitude: number,
  longitude: number,
  latitude: number,
  angle: number,
  satellites: number,
  speed: number,
  vehicleId: number,
  io: IO[]
|};

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
    io: {
      type: new GraphQLList(IoType),
      resolve: avl => getIoFromAvlId(avl.id)
    }
  })
});

export const AvlQuery = {
  description: "Get AVL data",
  type: new GraphQLList(AvlType),
  args: {
    date: { type: GraphQLString }
  },
  resolve: getAllAvlsFromDate
};
