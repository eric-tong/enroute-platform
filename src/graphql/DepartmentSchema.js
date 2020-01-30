// @flow

import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from "graphql";

import { getAllDepartments } from "../resolvers/DepartmentResolver";

const DepartmentType = new GraphQLObjectType({
  name: "DepartmentType",
  description: "Department with name and id",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    type: { type: GraphQLString }
  }
});

export const DepartmentsQuery = {
  description: "Get all departments",
  type: new GraphQLList(DepartmentType),
  resolve: getAllDepartments
};
