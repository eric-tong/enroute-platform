// @flow

import { GraphQLObjectType, GraphQLString } from "graphql";

import { BusStopType } from "./schema";
import { TripType } from "./TripType";
import { getBusStopFromId } from "../resolvers/busStops";

export const DepartureType = new GraphQLObjectType({
  name: "DepartureType",
  description: "Scheduled and predicted departure times of the vehicle",
  fields: () => ({
    scheduled: { type: GraphQLString },
    predicted: { type: GraphQLString },
    busStop: {
      type: BusStopType,
      resolve: departure => getBusStopFromId(departure.busStopId)
    },
    trip: {
      type: TripType,
      resolve: departure => ({
        id: departure.tripId
      })
    }
  })
});
