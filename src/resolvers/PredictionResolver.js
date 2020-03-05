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
import predictDelta from "../prediction/PredictDelta";

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

  const scheduledDepartures: ScheduledDeparture[] = await getScheduledDeparturesFromTripId(
    tripId
  );
  const upcomingScheduledDepartures = scheduledDepartures.slice(
    -1 * upcomingBusStops.length
  );

  const waypoints = [
    { longitude: avl.longitude, latitude: avl.latitude, roadAngle: avl.angle },
    ...upcomingBusStops.map(({ longitude, latitude, roadAngle }) => ({
      longitude,
      latitude,
      roadAngle
    }))
  ];
  const travelData = await getTravelData(waypoints);
  const minimumTimes = upcomingScheduledDepartures.map(scheduledDeparture =>
    toActualTime(scheduledDeparture.minuteOfDay)
  );

  // If vehicle is current at a bus stop and the bus stop is part of the trip
  // all subsequent predictions should start from the scheduled departure time
  // of the bus stop if it is currently before that time (assume waiting)
  const startTime = (() => {
    const avlTime = DateTime.fromSQL(avl.timestamp);
    if (
      !visitedBusStops.length ||
      !currentBusStop ||
      visitedBusStops[visitedBusStops.length - 1].id !== currentBusStop.id
    )
      return avlTime;

    const currentScheduledDeparture = scheduledDepartures.find(
      scheduledDeparture => scheduledDeparture.busStopId === currentBusStop.id
    );
    if (!currentScheduledDeparture) return avlTime;

    const scheduledDepartureTime = toActualTime(
      currentScheduledDeparture.minuteOfDay
    );
    if (avlTime.valueOf() > scheduledDepartureTime.valueOf()) return avlTime;
    return scheduledDepartureTime;
  })();

  const predictedTimes = getAccumulativeTimes(
    startTime,
    minimumTimes,
    travelData.map(data => data.duration)
  );

  const accumulativeDistances = getAccumulativeDistances(
    travelData.map(data => data.distance)
  );
  const predictedDeltas = await Promise.all(
    accumulativeDistances.map(distance =>
      predictDelta(tripId, distance).catch(error => {
        console.error(error);
        return 0;
      })
    )
  );

  Promise.all(
    predictedTimes.map((predictedTime, i) =>
      insertPrediction({
        predictedTimestamp: predictedTime.toSQL(),
        avlId: avl.id,
        scheduledDepartureId: upcomingScheduledDepartures[i].id,
        distance: accumulativeDistances[i],
        predictedDelta: predictedDeltas[i]
      })
    )
  );

  return predictedTimes;
}

async function getTravelData(
  waypoints: {|
    longitude: number,
    latitude: number,
    roadAngle: ?number
  |}[]
): Promise<{ duration: number, distance: number }[]> {
  const directions = await downloadDirections(waypoints);

  if (!directions || !directions.legs) {
    throw new Error("No directions returned from API");
  } else {
    return directions.legs.map(({ duration, distance }) => ({
      duration,
      distance
    }));
  }
}

function getAccumulativeTimes(
  startTime: DateTime,
  minimumTimes: DateTime[],
  durations: number[]
): DateTime[] {
  let accumulativeTime = startTime;
  const accumulativeTimes = [];

  for (let i = 0; i < durations.length; i++) {
    const predictedTime = accumulativeTime.plus({ seconds: durations[i] });
    accumulativeTimes.push(predictedTime);
    accumulativeTime = maxTime(predictedTime, minimumTimes[i]);
  }

  return accumulativeTimes;
}

function getAccumulativeDistances(distances: number[]) {
  let accumulativeDistance = 0;
  const accumulativeDistances = [];
  for (const distance of distances) {
    accumulativeDistance += distance;
    accumulativeDistances.push(accumulativeDistance);
  }
  return accumulativeDistances;
}

async function insertPrediction(prediction: {|
  scheduledDepartureId: number,
  avlId: number,
  predictedTimestamp: string,
  distance: number,
  predictedDelta: number
|}) {
  return database.query(
    "INSERT INTO predicted_departures (scheduled_departure_id, avl_id, predicted_timestamp, distance, predicted_delta) VALUES ($1, $2, $3, $4, $5)",
    [
      prediction.scheduledDepartureId,
      prediction.avlId,
      prediction.predictedTimestamp,
      prediction.distance,
      prediction.predictedDelta
    ]
  );
}
