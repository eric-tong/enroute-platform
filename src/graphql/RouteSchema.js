// @flow

import { GraphQLFloat, GraphQLList, GraphQLObjectType } from "graphql";

import { getRouteCoords } from "../resolvers/RouteResolver";

const LocationType = new GraphQLObjectType({
  name: "LocationType",
  description: "Point with latitude and longitude values",
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat }
  }
});

export const RouteQuery = {
  description: "Get coordinates along route of bus",
  type: new GraphQLList(LocationType),
  resolve: getRouteCoords
};
