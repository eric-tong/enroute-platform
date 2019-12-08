// @flow

import packet from "./packetData";
import parse from "../codec8Parser";

describe("Codec8 parsing", () => {
  test("parses stream", () => {
    const stream =
      "000000000000003608010000016B40D8EA30010000000100000002000300040500060105021503010101425E0F01F10000601A014E0000000000000000010000C7CF";

    const actual = parse(stream);
    const expected = {
      preamble: 0,
      dataFieldLength: 0x36,
      codecId: 8,
      avlDataCount: 1,
      avlData: [
        {
          timestamp: 0x16b40d8ea30,
          priority: 1,
          longitude: 1,
          latitude: 2,
          altitude: 3,
          angle: 4,
          satellites: 5,
          speed: 6,
          eventIOId: 1,
          totalIOCount: 5,
          oneByteIOCount: 2,
          oneByteIOData: [
            { ioId: 0x15, ioValue: 3 },
            { ioId: 1, ioValue: 1 },
          ],
          twoByteIOCount: 1,
          twoByteIOData: [{ ioId: 0x42, ioValue: 0x5e0f }],
          fourByteIOCount: 1,
          fourByteIOData: [{ ioId: 0xf1, ioValue: 0x0000601a }],
          eightByteIOCount: 1,
          eightByteIOData: [{ ioId: 0x4e, ioValue: 0 }],
        },
      ],
    };

    expect(actual).toEqual(expected);
  });
});
