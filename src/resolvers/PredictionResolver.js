// @flow

import {
  getBusStopFromAvlId,
  getBusStopsVisitedTodayFromTripId,
  getUpcomingBusStopsFromTripId
} from "./BusStopResolver";
import { maxTime, toActualTime } from "../utils/TimeUtils";

import { DateTime } from "luxon";
import database from "../database/database";
import { downloadDirections } from "../utils/MapboxUtils";
import { getAllVehicles } from "./VehicleResolver";
import { getLatestAvlFromVehicleId } from "./AvlResolver";
import { getScheduledDeparturesFromTripId } from "./ScheduledDepartureResolver";
import { getTripIdFromAvlId } from "./TripResolver";

export function insertAllPredictions() {
  return getAllVehicles().then(vehicles =>
    Promise.all(
      vehicles.map(vehicle =>
        getLatestAvlFromVehicleId(vehicle.id).then(avl =>
          insertPredictionsFromAvl(avl)
        )
      )
    )
  );
}

async function insertPredictionsFromAvl(avl: AVL) {
  const tripId = await getTripIdFromAvlId(avl.id);
  if (!tripId) return [];

  const currentBusStop = await getBusStopFromAvlId(avl.id);
  if (currentBusStop && currentBusStop.isTerminal) return [];

  const visitedBusStops = await getBusStopsVisitedTodayFromTripId(tripId);
  const upcomingBusStops = await getUpcomingBusStopsFromTripId(
    tripId,
    visitedBusStops.map(busStop => busStop.id)
  );
  if (upcomingBusStops.length < 1) return [];

  const upcomingScheduledDepartures: ScheduledDeparture[] = await getScheduledDeparturesFromTripId(
    tripId
  ).then(scheduledDepartures =>
    scheduledDepartures.slice(-1 * upcomingBusStops.length)
  );

  const waypoints = [
    { longitude: avl.longitude, latitude: avl.latitude, roadAngle: avl.angle },
    ...upcomingBusStops.map(({ longitude, latitude, roadAngle }) => ({
      longitude,
      latitude,
      roadAngle
    }))
  ];
  const durations = await getTravelDurations(waypoints);
  const minimumTimes = upcomingScheduledDepartures.map(scheduledDeparture =>
    toActualTime(scheduledDeparture.minuteOfDay)
  );

  const predictedTimes = getAccumulativeTimes(
    DateTime.fromSQL(avl.timestamp),
    minimumTimes,
    durations
  );

  Promise.all(
    predictedTimes.map((predictedTime, i) =>
      insertPrediction({
        predictedTimestamp: predictedTime.toSQL(),
        avlId: avl.id,
        scheduledDepartureId: upcomingScheduledDepartures[i].id
      })
    )
  );

  return predictedTimes;
}

async function getTravelDurations(
  waypoints: {|
    longitude: number,
    latitude: number,
    roadAngle: ?number
  |}[]
): Promise<number[]> {
  const directions = await downloadDirections(waypoints);

  if (!directions || !directions.legs) {
    throw new Error("No directions returned from API");
  } else {
    return directions.legs.map(leg => leg.duration);
  }
}

function getAccumulativeTimes(
  startTime: DateTime,
  minimumTimes: DateTime[],
  durations: number[]
): DateTime[] {
  let accumulativeTime = startTime;
  let accumulativeTimes = [];

  for (let i = 0; i < durations.length; i++) {
    const predictedTime = accumulativeTime.plus({ seconds: durations[i] });
    accumulativeTime = maxTime(predictedTime, minimumTimes[i]);
    accumulativeTimes.push(accumulativeTime);
  }

  return accumulativeTimes;
}

async function insertPrediction(prediction: {|
  scheduledDepartureId: number,
  avlId: number,
  predictedTimestamp: string
|}) {
  return database.query(
    "INSERT INTO predicted_departures (scheduled_departure_id, avl_id, predicted_timestamp) VALUES ($1, $2, $3)",
    [
      prediction.scheduledDepartureId,
      prediction.avlId,
      prediction.predictedTimestamp
    ]
  );
}
