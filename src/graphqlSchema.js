// @flow

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
} from "graphql";

const CoordsType = new GraphQLObjectType({
  name: "CoordsType",
  description: "Coordinates with x and y values",
  fields: {
    x: { type: GraphQLFloat },
    y: { type: GraphQLFloat },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      hello: {
        type: CoordsType,
        resolve() {
          return { x: 500, y: 500 };
        },
      },
    },
  }),
});

export default schema;
