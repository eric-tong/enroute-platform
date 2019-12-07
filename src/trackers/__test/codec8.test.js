// @flow

import packet from "./packetData";

/*

Bytes   Name                Description

4       Preamble            0x00000000
4       Data field length   Size from Codec Id to Number of Data 2
1       Codec ID            For Codec8 it's 0x08
1       Number of Data 1    A number which defines how many records is in the packet
X       AVL Data            Array (See below)
1       Number of Data 2    Same as Number of Data 1
4       CRC-16              Calculated from Codec ID to the Number of Data 2 (CRC-16/IBM)

(AVL DATA)
8       Timestamp           Milliseconds between the current time and midnight, January, 1970 UTC (UNIX time).
1       Priority            0 - Low, 1 - High, 2 - Panic
4       Longitude           East–west position
4       Latitude            North–south position
2       Altitude            Meters above sea level
2       Angle               Degrees from north pole
1       Satellites          Number of visible satellites
2       Speed               If GPS data is invalid, speed will be 0x0000

1       Event IO ID         If data is acquired on event – this field defines which IO property has changed and generated an event.
                            For example, when if Ignition state changed and it generate event, Event IO ID will be 
                            0xEF (AVL ID: 239). If it’s not eventual record – the value is 0.
1       Total IO Count      N1 + N2 + N3 + N4
1       N1                  Number of 1-byte IO items
2*N1    ID/Value            ID - 1 byte, value - 1 byte
1       N2                  Number of 2-byte IO items
2*N2    ID/Value            ID - 1 byte, value - 2 byte
1       N4                  Number of 1-byte IO items
2*N4    ID/Value            ID - 1 byte, value - 4 byte
1       N8                  Number of 1-byte IO items
2*N8    ID/Value            ID - 1 byte, value - 8 byte

(IO Data)

*/

describe("Codec8 Parsing", () => {
  test("adds 1 + 2 to equal 3", () => {
    expect(Array.isArray(packet)).toBe(true);
  });
});
