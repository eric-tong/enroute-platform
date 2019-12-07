// @flow

import packet from "./packetData";
import parse from "../codec8Parser";

const stream =
  "000000000000003608010000016B40D8EA30010000000000000000000000000000000105021503010101425E0F01F10000601A014E0000000000000000010000C7CF";
const data = parse(stream);

describe("Codec8 parsing", () => {
  test("parses preamble", () => {
    const expected = 0;
    expect(data.preamble).toBe(expected);
  });

  test("parses data field length", () => {
    const expected = parseInt("00000036", 16);
    expect(data.dataFieldLength).toBe(expected);
  });

  test("parses codec id", () => {
    const expected = 8;
    expect(data.codecId).toBe(8);
  });
});
