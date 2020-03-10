// @flow

import type { Codec8Data } from "./Codec8Schema";
import type { Socket } from "net";
import crcIsValid from "./Crc16Checker";
import { getVehicleFromImei } from "../resolvers/VehicleResolver";
import { insertBusStopVisitFromAvl } from "../resolvers/BusStopVisitResolver";
import { insertTrackerDataFromCodec8DataAndImei } from "../resolvers/TrackerDataResolver";
import net from "net";
import parseCodec8Stream from "./Codec8Parser";

type Client = {|
  name: string,
  header: ?string,
  imei: ?string,
  vehicle: ?Vehicle
|};

const REPLY = { ACCEPT: "\x01", REJECT: "\x00" };

const clients = new Map<Socket, Client>();
const port = process.env.PORT || 3000;

const server = net.createServer((socket: Socket) => {
  const client: Client = {
    name: `${socket.remoteAddress ?? "undefined"}:${socket.remotePort}`,
    header: undefined,
    imei: undefined,
    vehicle: undefined
  };
  clients.set(socket, client);
  console.log(new Date().toUTCString(), `Connected to ${client.name}`);

  socket.on("data", (stream: Buffer) => {
    if (!client.header) {
      const [header, imei] = stream.toString().split("\n");
      if (header.startsWith("PROXY TCP4")) {
        client.header = header;
        if (!imei) return;
        else setImei(imei);
      } else {
        write(REPLY.REJECT);
        socket.end();
      }
    } else if (!isNaN(stream.toString()) && !client.imei) {
      setImei(stream);
    } else if (client.imei && crcIsValid(stream)) {
      const imei = client.imei;
      const data: Codec8Data = parseCodec8Stream(stream.toString("hex"));
      save(data, imei);
      write(Buffer.from([0, 0, 0, data.avlDataCount]));
    } else {
      write(REPLY.REJECT);
      socket.end();
    }
  });

  socket.on("end", () => {
    clients.delete(socket);
    console.log(
      new Date().toUTCString(),
      "Disconnected from",
      client.vehicle ?? client.name
    );
    printClients();
  });

  async function setImei(stream: string | Buffer) {
    const imei = stream.slice(2).toString();
    const vehicle = await getVehicleFromImei(imei);
    if (vehicle) {
      console.log(new Date().toUTCString(), `Valid IMEI ${imei}.`, vehicle);
      client.imei = imei;
      client.vehicle = vehicle;
      write(REPLY.ACCEPT);
      printClients();
    } else {
      write(REPLY.REJECT);
      console.log(new Date().toUTCString(), `Invalid IMEI ${imei}`);
      socket.end();
    }
  }

  function write(message: string | Buffer) {
    socket.write(message);
  }
});

server.listen(port, () =>
  console.log(
    new Date().toUTCString(),
    `EnRoute TCP Platform successfully started at port ${port}.`
  )
);

async function save(data: Codec8Data, imei: string) {
  insertTrackerDataFromCodec8DataAndImei(data, imei)
    .then(avls => Promise.all(avls.map(insertBusStopVisitFromAvl)))
    .catch(console.error);
}

function printClients() {
  console.table(
    Array.from(clients.values()).map(client => ({
      ...client,
      vehicle: client.vehicle ? client.vehicle.id : undefined
    }))
  );
}
