// @flow

import { GraphQLObjectType, GraphQLString } from "graphql";

import { BusStopType } from "./BusStopSchema";
import { TripType } from "./TripSchema";
import { getBusStopFromId } from "../resolvers/BusStopResolver";
import { getPredictedDepartureTodayFromScheduledDepartureId } from "../resolvers/PredictedDepartureResolver";
import { toActualTime } from "../utils/TimeUtils";

export const DepartureType = new GraphQLObjectType({
  name: "DepartureType",
  description: "Scheduled and predicted departure times of the vehicle",
  fields: () => ({
    scheduledTimestamp: {
      type: GraphQLString,
      resolve: (departure: Departure) =>
        toActualTime(departure.scheduledDeparture.minuteOfDay).toSQL()
    },
    predictedTimestamp: {
      type: GraphQLString,
      resolve: (departure: Departure) =>
        getPredictedDepartureTodayFromScheduledDepartureId(
          departure.scheduledDeparture.id
        ).then(predictedDeparture =>
          predictedDeparture ? predictedDeparture.predictedTimestamp : null
        )
    },
    busStop: {
      type: BusStopType,
      resolve: (departure: Departure) =>
        getBusStopFromId(departure.scheduledDeparture.busStopId)
    },
    trip: {
      type: TripType,
      resolve: (departure: Departure) => ({
        id: departure.scheduledDeparture.tripId
      })
    }
  })
});
