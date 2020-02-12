// @flow

import { getAllVehicles } from "../resolvers/VehicleResolver";
import { getLatestAvlFromVehicleId } from "../resolvers/AvlResolver";
import { getTripIdFromVehicleId } from "../resolvers/TripResolver";

export type GlobalState = {|
  vehicleStates: VehicleState[]
|};

type TripState = {|
  id: ?number
|};

type TripStatus = "inProgress" | "complete" | "unknown";

type VehicleState = {|
  vehicle: Vehicle,
  trip: TripState,
  avl: AVL
|};

export async function getGlobalState(): Promise<GlobalState> {
  const vehicleStates = await getVehicleState();
  return { vehicleStates };
}

async function getVehicleState(): Promise<VehicleState[]> {
  const vehicles: Vehicle[] = await getAllVehicles();
  const vehicleStates = await Promise.all(
    vehicles.map(async vehicle => ({
      vehicle,
      trip: { id: await getTripIdFromVehicleId(vehicle.id) },
      avl: await getLatestAvlFromVehicleId(vehicle.id)
    }))
  );
  return vehicleStates;
}
