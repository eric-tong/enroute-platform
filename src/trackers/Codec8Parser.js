// @flow

import type { Codec8Data, DataSchema } from "./codec8Schema";

import schema from "./Codec8Schema";

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

Items that need verifying: Zero bytes, data field length, number of data 1 & 2, speed is 0 if invalid, CRC

*/

export default function parseCodec8Stream(stream: string): Codec8Data {
  let index = 0;

  function parse(dataSchema: DataSchema, prev: {}) {
    const result = Object.assign({}, prev);
    dataSchema.forEach(item => {
      if (item.schema) {
        const { key, schema, countKey } = item;
        result[key] = [];
        for (let i = 0; i < result[countKey]; i++) {
          result[key].push(parse(schema, prev));
        }
      } else {
        const { key, size, transform } = item;
        result[key] = parseInt(stream.substr(index * 2, size * 2), 16);
        if (transform) result[key] = transform(result[key]);
        index += size;
      }
    });
    return result;
  }

  // $FlowFixMe returns Codec8Data eventually
  return parse(schema, {});
}

export function parsePosition(data: number) {
  const mask = 1 << 31;
  const isNegative = (data & mask) != 0;
  return (isNegative ? ~data * -1 : data) / 1e7;
}
