// @flow

import { BusStopQuery, BusStopsQuery } from "./BusStopSchema";
import { CheckOutMutation, CreateNewCheckInMutation } from "./CheckInSchema";
import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { VehicleQuery, VehiclesQuery } from "./VehicleSchema";

import { AvlQuery } from "./AvlSchema";
import { RouteQuery } from "./RouteSchema";
import { TripQuery } from "./TripSchema";

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
    vehicles: VehiclesQuery,
    vehicle: VehicleQuery,
    busStops: BusStopsQuery,
    busStop: BusStopQuery,
    route: RouteQuery,
    avls: AvlQuery,
    trip: TripQuery
  }
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: MutationType
});

export default schema;
