// @flow

import type { Socket } from "net";
import crcIsValid from "./crc16Checker";
import net from "net";
import parseCodec8Stream from "./codec8Parser";

type Client = {|
  name: string,
  header: ?string,
  imei: ?string,
|};

const REPLY = { ACCEPT: "\x01", REJECT: "\x00" };

const clients = new Map<Socket, Client>();
const validImeis = ["358480089803458"];
const port = process.env.PORT || 3000;

const server = net.createServer((socket: Socket) => {
  const client: Client = {
    name: `${socket.remoteAddress ?? "undefined"}:${socket.remotePort}`,
    header: undefined,
    imei: undefined,
  };
  console.log(`Connected to ${client.name}`);

  socket.on("data", (stream: Buffer) => {
    console.log({
      stream:
        !client.header || !client.imei
          ? stream.toString()
          : stream.toString("hex"),
    });

    if (!client.header) {
      const [header, imei] = stream.toString().split("\n");
      if (header.startsWith("PROXY TCP4")) {
        client.header = header;
        if (!imei) return;
        else setImei(imei);
      } else {
        write(REPLY.REJECT);
        console.log("Invalid header");
      }
    } else if (!client.imei) {
      setImei(stream);
    } else if (crcIsValid(stream)) {
      const data: any = parseCodec8Stream(stream.toString("hex"));
      console.log("Valid CRC", data);
      write(Buffer.from([0, 0, 0, data.avlDataCount]));
    } else {
      console.log("Invalid CRC");
      write(REPLY.REJECT);
    }
  });

  socket.on("end", () => console.log(`Disconnected from ${client.name}`));

  function setImei(stream: string | Buffer) {
    const imei = stream.slice(2).toString();
    if (validImeis.includes(imei)) {
      client.imei = imei;
      write(REPLY.ACCEPT);
    } else {
      write(REPLY.REJECT);
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
