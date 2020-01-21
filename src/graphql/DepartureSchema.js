// @flow

import { GraphQLObjectType, GraphQLString } from "graphql";

import { BusStopType } from "./BusStopSchema";
import { TripType } from "./TripSchema";
import { getBusStopFromId } from "../resolvers/BusStopResolver";
import { stringify } from "node-persist";

export type Departure = {|
  scheduled: string,
  predicted: string
|};

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
