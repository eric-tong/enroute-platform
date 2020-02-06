// @flow

import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from "graphql";

import { AvlType } from "./AvlSchema";
import { getAllVehicles } from "../resolvers/VehicleResolver";
import { getLatestAvlFromVehicleId } from "../resolvers/AvlResolver";
import { getTripIdFromVehicleId } from "../resolvers/TripResolver";

const VehicleType = new GraphQLObjectType({
  name: "VehicleType",
  description: "Vehicle id with timestamped coordinates",
  fields: () => ({
    id: { type: GraphQLInt },
    registration: { type: GraphQLString },
    imei: { type: GraphQLString },
    avl: {
      type: AvlType,
      resolve: (vehicle: Vehicle) => getLatestAvlFromVehicleId(vehicle.id)
    },
    trip: {
      type: GraphQLInt,
      resolve: (vehicle: Vehicle) => getTripIdFromVehicleId(vehicle.id)
    }
  })
});

export const VehicleQuery = {
  description: "Query for all vehicles",
  type: new GraphQLList(VehicleType),
  resolve: getAllVehicles
};
