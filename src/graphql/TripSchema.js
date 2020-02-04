// @flow

import { GraphQLInt, GraphQLList, GraphQLObjectType } from "graphql";

import { DepartureType } from "./DepartureSchema";
import { getAllDeparturesFromTripId } from "../resolvers/DepartureResolver";

export const TripType = new GraphQLObjectType({
  name: "TripType",
  description: "A list of departures in a given trip",
  fields: () => ({
    id: { type: GraphQLInt },
    departures: {
      type: new GraphQLList(DepartureType),
      resolve: (trip, options) => getAllDeparturesFromTripId(trip.id, options)
    }
  })
});
