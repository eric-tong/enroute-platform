// @flow

import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from "graphql";

import { AvlType } from "./AvlSchema";
import { getAllVehicles } from "../resolvers/VehicleResolver";
import { getLatestAvlOfVehicle } from "../resolvers/AvlResolver";

const VehicleType = new GraphQLObjectType({
  name: "VehicleType",
  description: "Vehicle id with timestamped coordinates",
  fields: () => ({
    id: { type: GraphQLInt },
    registration: { type: GraphQLString },
    imei: { type: GraphQLString },
    avl: { type: AvlType, resolve: getLatestAvlOfVehicle }
  })
});

export const VehicleQuery = {
  description: "Query for all vehicles",
  type: new GraphQLList(VehicleType),
  resolve: getAllVehicles
};
