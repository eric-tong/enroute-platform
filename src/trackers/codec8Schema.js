// @flow

export type DataSchema = [string, number | [DataSchema, string]][];

const ioDataSchema: (1 | 2 | 4 | 8) => DataSchema = size => [
  ["ioId", 1],
  ["ioValue", size],
];
const avlDataSchema: DataSchema = [
  ["timestamp", 8],
  ["priority", 1],
  ["longitude", 4],
  ["latitude", 4],
  ["altitude", 2],
  ["angle", 2],
  ["satellites", 1],
  ["speed", 2],
  ["eventIOId", 1],
  ["totalIOCount", 1],
  ["oneByteIOCount", 1],
  ["oneByteIOData", [ioDataSchema(1), "oneByteIOCount"]],
  ["twoByteIOCount", 1],
  ["twoByteIOData", [ioDataSchema(2), "twoByteIOCount"]],
  ["fourByteIOCount", 1],
  ["fourByteIOData", [ioDataSchema(4), "fourByteIOCount"]],
  ["eightByteIOCount", 1],
  ["eightByteIOData", [ioDataSchema(8), "eightByteIOCount"]],
];
const dataSchema: DataSchema = [
  ["preamble", 4],
  ["dataFieldLength", 4],
  ["codecId", 1],
  ["avlDataCount", 1],
  ["avlData", [avlDataSchema, "avlDataCount"]],
  ["avlDataCountTwo", 1],
  ["crc", 4],
];

export default dataSchema;
