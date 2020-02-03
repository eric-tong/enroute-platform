// @flow

import crcIsValid, { generateCRC16 } from "../Crc16Checker";

import type { Codec8Data } from "../Codec8Schema";
import { DateTime } from "luxon";
import parse from "../Codec8Parser";

describe("Codec8 parsing", () => {
  test("parses stream 1", () => {
    const stream =
      "000000000000003608010000016B40D8EA3001ff38b6af1ee2c267000300040500060105021503010101425E0F01F10000601A014E0000000000000000010000C7CF";

    const actual = parse(stream);
    const expected = {
      preamble: 0,
      dataFieldLength: 0x36,
      codecId: 8,
      avlDataCount: 1,
      avlData: [
        {
          timestamp: DateTime.fromMillis(0x16b40d8ea30),
          priority: "high",
          longitude: -1.3060432,
          latitude: 51.8177383,
          altitude: 3,
          angle: 4,
          satellites: 5,
          speed: 6,
          eventIOId: 1,
          totalIOCount: 5,
          oneByteIOCount: 2,
          oneByteIOData: [
            { ioId: 0x15, ioValue: 3 },
            { ioId: 1, ioValue: 1 }
          ],
          twoByteIOCount: 1,
          twoByteIOData: [{ ioId: 0x42, ioValue: 0x5e0f }],
          fourByteIOCount: 1,
          fourByteIOData: [{ ioId: 0xf1, ioValue: 0x0000601a }],
          eightByteIOCount: 1,
          eightByteIOData: [{ ioId: 0x4e, ioValue: 0 }]
        }
      ],
      avlDataCountTwo: 1,
      crc: 0xc7cf
    };

    expect(actual).toEqual(expected);
  });

  test("parses stream 2", () => {
    const stream =
      "000000000000002808010000016B40D9AD80010000000000000000000000000000000103021503010101425E100000010000F22A";

    const actual = parse(stream);
    const expected = {
      preamble: 0,
      dataFieldLength: 0x28,
      codecId: 8,
      avlDataCount: 1,
      avlData: [
        {
          timestamp: DateTime.fromMillis(0x016b40d9ad80),
          priority: "high",
          longitude: 0,
          latitude: 0,
          altitude: 0,
          angle: 0,
          satellites: 0,
          speed: 0,
          eventIOId: 1,
          totalIOCount: 3,
          oneByteIOCount: 2,
          oneByteIOData: [
            { ioId: 0x15, ioValue: 3 },
            { ioId: 1, ioValue: 1 }
          ],
          twoByteIOCount: 1,
          twoByteIOData: [{ ioId: 0x42, ioValue: 0x5e10 }],
          fourByteIOCount: 0,
          fourByteIOData: [],
          eightByteIOCount: 0,
          eightByteIOData: []
        }
      ],
      avlDataCountTwo: 1,
      crc: 0xf22a
    };

    expect(actual).toEqual(expected);
  });

  test("parses stream 3", () => {
    const stream =
      "000000000000004308020000016B40D57B480100000000000000000000000000000001010101000000000000016B40D5C198010000000000000000000000000000000101010101000000020000252C";

    const actual = parse(stream);
    const expected = {
      preamble: 0,
      dataFieldLength: 0x43,
      codecId: 8,
      avlDataCount: 2,
      avlData: [
        {
          timestamp: DateTime.fromMillis(0x016b40d57b48),
          priority: "high",
          longitude: 0,
          latitude: 0,
          altitude: 0,
          angle: 0,
          satellites: 0,
          speed: 0,
          eventIOId: 1,
          totalIOCount: 1,
          oneByteIOCount: 1,
          oneByteIOData: [{ ioId: 1, ioValue: 0 }],
          twoByteIOCount: 0,
          twoByteIOData: [],
          fourByteIOCount: 0,
          fourByteIOData: [],
          eightByteIOCount: 0,
          eightByteIOData: []
        },
        {
          timestamp: DateTime.fromMillis(0x016b40d5c198),
          priority: "high",
          longitude: 0,
          latitude: 0,
          altitude: 0,
          angle: 0,
          satellites: 0,
          speed: 0,
          eventIOId: 1,
          totalIOCount: 1,
          oneByteIOCount: 1,
          oneByteIOData: [{ ioId: 1, ioValue: 1 }],
          twoByteIOCount: 0,
          twoByteIOData: [],
          fourByteIOCount: 0,
          fourByteIOData: [],
          eightByteIOCount: 0,
          eightByteIOData: []
        }
      ],
      avlDataCountTwo: 2,
      crc: 0x252c
    };

    expect(actual).toEqual(expected);
  });

  test("generates crc 1", () => {
    const string =
      "08010000016B40D8EA30010000000000000000000000000000000105021503010101425E0F01F10000601A014E000000000000000001";
    const stream = Buffer.from(string, "hex");

    const actual = generateCRC16(stream);
    const expected = 0xc7cf;

    expect(actual).toEqual(expected);
  });
  test("generates crc 2", () => {
    const string =
      "08010000016B40D9AD80010000000000000000000000000000000103021503010101425E10000001";
    const stream = Buffer.from(string, "hex");

    const actual = generateCRC16(stream);
    const expected = 0xf22a;

    expect(actual).toEqual(expected);
  });
  test("generates crc 3", () => {
    const string =
      "08020000016B40D57B480100000000000000000000000000000001010101000000000000016B40D5C19801000000000000000000000000000000010101010100000002";
    const stream = Buffer.from(string, "hex");

    const actual = generateCRC16(stream);
    const expected = 0x252c;

    expect(actual).toEqual(expected);
  });

  test("validates crc", () => {
    const string =
      "000000000000004408010000016ee7c3b89000ff38b67d1ee2c58700440000070000000c05ef00f0001504c800450105b50007b6000642302d43000044000002f100005b721000000003000100000cac";
    const stream = Buffer.from(string, "hex");

    const actual = crcIsValid(stream);

    expect(actual).toEqual(true);
  });
});
