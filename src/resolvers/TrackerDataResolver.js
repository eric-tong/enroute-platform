// @flow

import type { AVLData, Codec8Data, IOData } from "../trackers/codec8Schema";

import database from "../database/database";

export function insertTrackerDataFromCodec8DataAndImei(
  data: Codec8Data,
  imei: string
): Promise<number[]> {
  const GET_VEHICLE_ID_FROM_IMEI =
    "SELECT id FROM vehicles WHERE imei = $1 LIMIT 1";

  return Promise.all(
    data.avlData.map(avlData =>
      database
        .query<{ id: number }>(GET_VEHICLE_ID_FROM_IMEI, [imei])
        .then(results => results.rows[0].id)
        .then(vehicleId => insertAvlFromAvlData(avlData, vehicleId))
        .then(avlId => {
          insertIoFromIoData(
            [
              ...avlData.oneByteIOData,
              ...avlData.twoByteIOData,
              ...avlData.fourByteIOData,
              ...avlData.eightByteIOData
            ],
            avlId
          );
          return avlId;
        })
    )
  );
}

export function insertAvlFromAvlData(avlData: AVLData, vehicleId: number) {
  const INSERT_AVL = `
  INSERT INTO avl (timestamp, priority, longitude, latitude, altitude, angle, satellites, speed, vehicle_id, event_io_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
  `;

  return database
    .query<{ id: number }>(INSERT_AVL, [
      avlData.timestamp.toSQL(),
      avlData.priority,
      avlData.longitude,
      avlData.latitude,
      avlData.altitude,
      avlData.angle,
      avlData.satellites,
      avlData.speed,
      vehicleId,
      avlData.eventIOId
    ])
    .then(results => results.rows[0].id);
}

export function insertIoFromIoData(ioData: IOData[], avlId: number) {
  const INSERT_IO = `
  INSERT INTO io (avl_id, io_name_id, value) 
    VALUES ($1, $2, $3)
  `;

  return Promise.all(
    ioData.map(ioData =>
      database.query(INSERT_IO, [avlId, ioData.ioId, ioData.ioValue])
    )
  );
}
