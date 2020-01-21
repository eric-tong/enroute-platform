// @flow

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from "graphql";
import { getBusStopFromUrl, getBusStops } from "../resolvers/BusStopResolver";

import { DepartureType } from "./DepartureSchema";
import { getDeparturesFromBusStop } from "../resolvers/DepartureResolver";

export const BusStopType = new GraphQLObjectType({
  name: "BusStopType",
  description: "Bus stop with location",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    street: { type: GraphQLString },
    icon: { type: GraphQLString },
    url: { type: GraphQLString },
    direction: { type: GraphQLString },
    departures: {
      type: new GraphQLList(DepartureType),
      args: { maxLength: { type: GraphQLInt } },
      resolve: getDeparturesFromBusStop
    },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat }
  })
});

export const BusStopsQuery = {
  description: "Get bus stops and their locations",
  type: new GraphQLList(BusStopType),

  resolve: getBusStops
};

export const BusStopQuery = {
  description: "Get one bus stop with its unique url",
  type: BusStopType,
  args: { url: { type: GraphQLString } },
  resolve: getBusStopFromUrl
};
