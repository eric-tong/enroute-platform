// @flow

import { BusStopQuery, BusStopsQuery } from "./BusStopSchema";
import { CheckOutMutation, CreateNewCheckInMutation } from "./CheckInSchema";
import { GraphQLObjectType, GraphQLSchema } from "graphql";

import { AvlQuery } from "./AvlSchema";
import { RouteQuery } from "./RouteSchema";
import { VehicleQuery } from "./VehicleSchema";

const MutationType = new GraphQLObjectType({
  name: "MutationType",
  fields: {
    createNewCheckIn: CreateNewCheckInMutation,
    checkOut: CheckOutMutation
  }
});

const RootQueryType = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    vehicles: VehicleQuery,
    busStops: BusStopsQuery,
    busStop: BusStopQuery,
    route: RouteQuery,
    avls: AvlQuery
  }
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: MutationType
});

export default schema;
