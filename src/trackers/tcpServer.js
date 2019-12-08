// @flow

import net from "net";
import parseCodec8Stream from "./codec8Parser";

type ParsedDataType =
  | { type: "imei", imei: string }
  | { type: "avl", avl: any };

const imeis = new Map();
const validImeis = ["358480089803458"];
const port = process.env.PORT || 3000;

const IMEI_REPLY = { ACCEPT: "\x01", REJECT: "\x00" };

const server = net.createServer(socket => {
  console.log(`Connected to ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on("data", function(stream) {
    console.log({ stream });
    try {
      const data = parse(stream);
      if (data.type === "imei") {
        if (validImeis.includes(data.imei)) {
          imeis.set(socket, data.imei);
          socket.write(IMEI_REPLY.ACCEPT);
        } else {
          socket.write(IMEI_REPLY.REJECT);
          throw new Error(`Invalid IMEI ${data.imei}`);
        }
      } else if (data.type === "avl") {
        console.log(data.avl);
        socket.write(Buffer.from[(0, 0, 0, data.avl.avlDataCount)]);
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("end", function() {
    imeis.delete(socket);
    console.log(
      `Disconnected from ${socket.remoteAddress}:${socket.remotePort}`
    );
  });

  function parse(stream: Buffer): ParsedDataType {
    if (imeis.has(socket)) {
      return {
        type: "avl",
        avl: parseCodec8Stream(stream.toString("hex")),
      };
    } else if (stream.length > 2) {
      return { type: "imei", imei: stream.slice(2).toString() };
    } else {
      throw new Error("Invalid stream");
    }
  }
});

server.listen(port, () =>
  console.log(`EnRoute TCP Platform successfully started at port ${port}.`)
);
