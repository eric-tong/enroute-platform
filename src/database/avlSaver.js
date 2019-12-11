// @flow

import type { Codec8Data } from "../trackers/codec8Schema";
import database from "./database";

const VEHICLE_ID_FROM_IMEI = "SELECT id FROM vehicles WHERE imei = $1 LIMIT 1";
const INSERT_AVL_DATA = `
INSERT INTO avl (timestamp, priority, longitude, latitude, altitude, angle, satellites, speed, vehicle_id, event_io_id) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING id
`;
const INSERT_IO_DATA = `
INSERT INTO io (avl_id, id, value) 
  VALUES ($1, $2, $3)
`;

export default function saveAVLData(data: Codec8Data, imei: string) {
  data.avlData.forEach(avlData =>
    database
      .query<{ id: number }>(VEHICLE_ID_FROM_IMEI, [imei])
      .then(results => results.rows[0].id)
      .then(vehicleId =>
        database.query<{ id: number }>(INSERT_AVL_DATA, [
          avlData.timestamp.toSQL(),
          avlData.priority,
          avlData.longitude,
          avlData.latitude,
          avlData.altitude,
          avlData.angle,
          avlData.satellites,
          avlData.speed,
          vehicleId,
          avlData.eventIOId,
        ])
      )
      .then(results => results.rows[0].id)
      .then(avlId => {
        Promise.all(
          [
            ...avlData.oneByteIOData,
            ...avlData.twoByteIOData,
            ...avlData.fourByteIOData,
            ...avlData.eightByteIOData,
          ].map(ioData =>
            database.query(INSERT_IO_DATA, [avlId, ioData.ioId, ioData.ioValue])
          )
        );
      })
      .catch(console.log)
  );
}
