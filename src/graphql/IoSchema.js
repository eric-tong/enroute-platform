// @flow

import { GraphQLInt, GraphQLObjectType, GraphQLString } from "graphql";

export const IoType = new GraphQLObjectType({
  name: "IO",
  description: "IO elements data",
  fields: {
    name: { type: GraphQLString },
    value: { type: GraphQLInt }
  }
});
