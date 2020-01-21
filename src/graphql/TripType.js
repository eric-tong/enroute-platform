// @flow

import { GraphQLInt, GraphQLList, GraphQLObjectType } from "graphql";

import { DepartureType } from "./DepartureType";
import { getScheduledDeparturesFromTripId } from "../resolvers/departures";

export const TripType = new GraphQLObjectType({
  name: "TripType",
  description: "A list of departures in a given trip",
  fields: () => ({
    id: { type: GraphQLInt },
    departures: {
      type: new GraphQLList(DepartureType),
      resolve: trip => getScheduledDeparturesFromTripId(trip.id)
    }
  })
});
