// @flow

import {
  insertBusStopProxyVisitFromAvl,
  insertBusStopVisitFromAvl
} from "../resolvers/BusStopVisitResolver";

import type { Codec8Data } from "./Codec8Schema";
import type { Socket } from "net";
import crcIsValid from "./Crc16Checker";
import { imeiIsValid } from "../resolvers/VehicleResolver";
import { insertTrackerDataFromCodec8DataAndImei } from "../resolvers/TrackerDataResolver";
import net from "net";
import parseCodec8Stream from "./Codec8Parser";

type Client = {|
  name: string,
  header: ?string,
  imei: ?string
|};

const REPLY = { ACCEPT: "\x01", REJECT: "\x00" };

const clients = new Map<Socket, Client>();
const port = process.env.PORT || 3000;

const server = net.createServer((socket: Socket) => {
  const client: Client = {
    name: `${socket.remoteAddress ?? "undefined"}:${socket.remotePort}`,
    header: undefined,
    imei: undefined
  };
  console.log(`Connected to ${client.name}`);

  socket.on("data", (stream: Buffer) => {
    if (!client.header) {
      const [header, imei] = stream.toString().split("\n");
      if (header.startsWith("PROXY TCP4")) {
        client.header = header;
        if (!imei) return;
        else setImei(imei);
      } else {
        write(REPLY.REJECT);
      }
    } else if (!client.imei) {
      setImei(stream);
    } else if (client.imei && crcIsValid(stream)) {
      const imei = client.imei;
      const data: Codec8Data = parseCodec8Stream(stream.toString("hex"));
      save(data, imei);
      write(Buffer.from([0, 0, 0, data.avlDataCount]));
    } else {
      write(REPLY.REJECT);
    }
  });

  socket.on("end", () => console.log(`Disconnected from ${client.name}`));

  async function setImei(stream: string | Buffer) {
    const imei = stream.slice(2).toString();
    if (await imeiIsValid(imei)) {
      console.log(`Valid IMEI ${imei}`);
      client.imei = imei;
      write(REPLY.ACCEPT);
    } else {
      write(REPLY.REJECT);
      console.log(`Invalid IMEI ${imei}`);
      socket.end();
    }
  }

  function write(message: string | Buffer) {
    socket.write(message);
  }
});

server.listen(port, () =>
  console.log(`EnRoute TCP Platform successfully started at port ${port}.`)
);

async function save(data: Codec8Data, imei: string) {
  insertTrackerDataFromCodec8DataAndImei(data, imei)
    .then(avls =>
      avls.forEach(avl => {
        if (!avl) return;
        insertBusStopVisitFromAvl(avl);
        insertBusStopProxyVisitFromAvl(avl);
      })
    )
    .catch(console.error);
}
