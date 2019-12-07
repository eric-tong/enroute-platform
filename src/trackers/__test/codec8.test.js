// @flow

import packet from "./packetData";
import parse from "../codec8Parser";

describe("Codec8 parsing", () => {
  test("parses stream", () => {
    const stream =
      "000000000000003608010000016B40D8EA30010000000000000000000000000000000105021503010101425E0F01F10000601A014E0000000000000000010000C7CF";

    const actual = parse(stream);
    const expected = {
      preamble: 0,
      dataFieldLength: parseInt("36", 16),
      codecId: 8,
      avlDataCount: 1,
      timestamp: parseInt("16B40D8EA30", 16),
    };

    expect(actual).toEqual(expected);
  });
});
