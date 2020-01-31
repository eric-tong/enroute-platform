// @flow

import { GraphQLInt, GraphQLString } from "graphql";
import {
  checkOutFromCheckInId,
  createCheckIn
} from "../resolvers/CheckInResolver";

export const CreateNewCheckInMutation = {
  description: "Create a new check in instance",
  type: GraphQLInt,
  args: {
    departmentType: { type: GraphQLString },
    vehicleRegistration: { type: GraphQLString }
  },
  resolve: (...args: any) =>
    createCheckIn(...args).then(checkIn => (checkIn ? checkIn.id : -1))
};

export const CheckOutMutation = {
  description: "Remove a check in instance",
  type: GraphQLInt,
  args: {
    id: { type: GraphQLInt }
  },
  resolve: (...args: any) =>
    checkOutFromCheckInId(...args).then(checkIn => (checkIn ? checkIn.id : -1))
};
