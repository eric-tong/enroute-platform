// @flow

import type { Socket } from "net";
import net from "net";
import parseCodec8Stream from "./codec8Parser";

type ParsedDataType =
  | { type: "imei", imei: string }
  | { type: "avl", avl: any };
type Client = {|
  name: string,
  ip: ?string,
  imei: ?string,
|};

const IMEI_REPLY = { ACCEPT: "\x01", REJECT: "\x00" };

const clients = new Map<Socket, Client>();
const validImeis = ["358480089803458"];
const port = process.env.PORT || 3000;

const server = net.createServer((socket: Socket) => {
  const client: Client = {
    name: `${socket.remoteAddress ?? "undefined"}:${socket.remotePort}`,
    ip: undefined,
    imei: undefined,
  };
  console.log(`Connected to ${client.name}`);

  socket.on("data", (stream: Buffer) => {
    console.log({ stream });

    if (!client.ip) {
      client.ip = stream.toString();
    } else if (!client.imei) {
      const imei = stream.slice(2).toString();
      if (validImeis.includes(imei)) {
        client.imei = imei;
        socket.write(IMEI_REPLY.ACCEPT);
      } else {
        socket.write(IMEI_REPLY.REJECT);
        console.log(`Invalid IMEI ${imei}`);
      }
    } else {
      const data: any = parseCodec8Stream(stream.toString("hex"));
      console.log(data);
      socket.write(Buffer.from[(0, 0, 0, data.avlDataCount)]);
    }
  });

  socket.on("end", () => console.log(`Disconnected from ${client.name}`));
});

server.listen(port, () =>
  console.log(`EnRoute TCP Platform successfully started at port ${port}.`)
);
