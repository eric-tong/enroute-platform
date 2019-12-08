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
    console.log({
      stream: stream.length < 100 ? stream.toString() : stream.toString("hex"),
    });

    if (!client.ip) {
      const [ip, imei] = stream.toString().split("\n");
      client.ip = ip;
      if (!imei) return;
      else setImei(imei);
    } else if (!client.imei) {
      setImei(stream);
    } else {
      const data: any = parseCodec8Stream(stream.toString("hex"));
      console.log(data);
      write(Buffer.from([(0, 0, 0, data.avlDataCount)]));
    }
  });

  socket.on("end", () => console.log(`Disconnected from ${client.name}`));

  function setImei(stream: string | Buffer) {
    const imei = stream.slice(2).toString();
    if (validImeis.includes(imei)) {
      client.imei = imei;
      write(IMEI_REPLY.ACCEPT);
    } else {
      write(IMEI_REPLY.REJECT);
      console.log(`Invalid IMEI ${imei}`);
    }
  }

  function write(message: string | Buffer) {
    console.log("Write", message);
    socket.write(message);
  }
});

server.listen(port, () =>
  console.log(`EnRoute TCP Platform successfully started at port ${port}.`)
);
