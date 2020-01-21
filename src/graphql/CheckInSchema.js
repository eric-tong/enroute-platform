// @flow

import { GraphQLInt, GraphQLString } from "graphql";
import { checkOutWithId, createCheckIn } from "../resolvers/CheckInResolver";

export const CreateNewCheckInMutation = {
  description: "Create a new check in instance",
  type: GraphQLInt,
  args: {
    departmentType: { type: GraphQLString },
    vehicleRegistration: { type: GraphQLString }
  },
  resolve: createCheckIn
};

export const CheckOutMutation = {
  description: "Remove a check in instance",
  type: GraphQLInt,
  args: {
    id: { type: GraphQLInt }
  },
  resolve: checkOutWithId
};
