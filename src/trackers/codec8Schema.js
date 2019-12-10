// @flow

type Size = 1 | 2 | 4 | 8;
export type DataSchema = (
  | $Exact<{
      key: string,
      size: Size,
      transform?: number => mixed,
    }>
  | $Exact<{ key: string, schema: DataSchema, countKey: string }>
)[];

const ioDataSchema: Size => DataSchema = size => [
  { key: "ioId", size: 1 },
  { key: "ioValue", size },
];
const avlDataSchema: DataSchema = [
  { key: "timestamp", size: 8 },
  { key: "priority", size: 1 },
  { key: "longitude", size: 4 },
  { key: "latitude", size: 4 },
  { key: "altitude", size: 2 },
  { key: "angle", size: 2 },
  { key: "satellites", size: 1 },
  { key: "speed", size: 2 },
  { key: "eventIOId", size: 1 },
  { key: "totalIOCount", size: 1 },
  { key: "oneByteIOCount", size: 1 },
  {
    key: "oneByteIOData",
    schema: ioDataSchema(1),
    countKey: "oneByteIOCount",
  },
  { key: "twoByteIOCount", size: 1 },
  {
    key: "twoByteIOData",
    schema: ioDataSchema(2),
    countKey: "twoByteIOCount",
  },
  { key: "fourByteIOCount", size: 1 },
  {
    key: "fourByteIOData",
    schema: ioDataSchema(4),
    countKey: "fourByteIOCount",
  },
  { key: "eightByteIOCount", size: 1 },
  {
    key: "eightByteIOData",
    schema: ioDataSchema(8),
    countKey: "eightByteIOCount",
  },
];
const dataSchema: DataSchema = [
  { key: "preamble", size: 4 },
  { key: "dataFieldLength", size: 4 },
  { key: "codecId", size: 1 },
  { key: "avlDataCount", size: 1 },
  { key: "avlData", schema: avlDataSchema, countKey: "avlDataCount" },
  { key: "avlDataCountTwo", size: 1 },
  { key: "crc", size: 4 },
];

export default dataSchema;
