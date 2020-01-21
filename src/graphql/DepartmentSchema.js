// @flow

import { GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";

import { getDepartments } from "../resolvers/CheckInResolver";

const DepartmentType = new GraphQLObjectType({
  name: "DepartmentType",
  description: "Deparment with name and id",
  fields: {
    name: { type: GraphQLString },
    type: { type: GraphQLString }
  }
});

export const DepartmentsQuery = {
  description: "Get departments",
  type: new GraphQLList(DepartmentType),
  resolve: getDepartments
};
