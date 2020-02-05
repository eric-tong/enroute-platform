// @flow

import { GraphQLInt, GraphQLList, GraphQLObjectType } from "graphql";
import {
  getAllDeparturesFromTripId,
  getUpcomingDeparturesFromTripId
} from "../resolvers/DepartureResolver";

import { DepartureType } from "./DepartureSchema";

export const TripType = new GraphQLObjectType({
  name: "TripType",
  description: "A list of departures in a given trip",
  fields: () => ({
    id: { type: GraphQLInt },
    departures: {
      type: new GraphQLList(DepartureType),
      resolve: trip => getAllDeparturesFromTripId(trip.id)
    }
  })
});
