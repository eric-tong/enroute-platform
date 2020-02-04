// @flow

import { GraphQLBoolean, GraphQLObjectType, GraphQLString } from "graphql";

import { BusStopType } from "./BusStopSchema";
import { DateTime } from "luxon";
import { TripType } from "./TripSchema";
import { getAvlFromAvlId } from "../resolvers/AvlResolver";
import { getBusStopFromId } from "../resolvers/BusStopResolver";
import { getPredictedDepartureTodayFromScheduledDepartureId } from "../resolvers/PredictedDepartureResolver";
import { toActualTime } from "../utils/TimeUtils";

export const DepartureType = new GraphQLObjectType({
  name: "DepartureType",
  description: "Scheduled and predicted departure times of the vehicle",
  fields: () => ({
    scheduledTimestamp: {
      type: GraphQLString,
      resolve: ({ scheduledDeparture }: Departure) =>
        toActualTime(scheduledDeparture.minuteOfDay).toSQL()
    },
    predictedTimestamp: {
      type: GraphQLString,
      resolve: ({ predictedDeparture }: Departure) =>
        predictedDeparture
          ? DateTime.fromMillis(
              parseInt(predictedDeparture.predictedTimestamp, 10)
            ).toSQL()
          : null
    },
    actualTimestamp: {
      type: GraphQLString,
      resolve: ({ actualDeparture }: Departure) =>
        actualDeparture
          ? getAvlFromAvlId(actualDeparture.avlId).then(avl => avl.timestamp)
          : null
    },
    isAtBusStop: {
      type: GraphQLBoolean
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
