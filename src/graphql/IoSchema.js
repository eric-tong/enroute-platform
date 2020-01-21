// @flow

import { GraphQLInt, GraphQLObjectType, GraphQLString } from "graphql";

export type IO = {|
  name: string,
  value: number
|};

export const IoType = new GraphQLObjectType({
  name: "IO",
  description: "IO elements data",
  fields: {
    name: { type: GraphQLString },
    value: { type: GraphQLInt }
  }
});
