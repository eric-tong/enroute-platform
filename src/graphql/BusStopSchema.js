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
import {
  getAllBusStops,
  getBusStopFromUrl
} from "../resolvers/BusStopResolver";

import type { Departure } from "./DepartureSchema";
import { DepartureType } from "./DepartureSchema";
import { getDeparturesFromBusStop } from "../resolvers/DepartureResolver";

export type BusStop = {|
  id: number,
  name: string,
  street: string,
  icon: string,
  url: string,
  direction: string,
  latitude: number,
  longitude: number,
  roadAngle: number,
  departures: Departure[]
|};

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
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    roadAngle: { type: GraphQLFloat },
    departures: {
      type: new GraphQLList(DepartureType),
      args: { maxLength: { type: GraphQLInt } },
      resolve: getDeparturesFromBusStop
    }
  })
});

export const BusStopsQuery = {
  description: "Get bus stops and their locations",
  type: new GraphQLList(BusStopType),
  resolve: getAllBusStops
};

export const BusStopQuery = {
  description: "Get one bus stop with its unique url",
  type: BusStopType,
  args: { url: { type: GraphQLString } },
  resolve: getBusStopFromUrl
};
