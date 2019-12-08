// @flow

export default function crcIsValid(stream: Buffer) {
  return (
    generateCRC16(stream.slice(8, -4)).toString(16) ===
    stream.slice(-2).toString("hex")
  );
}

export function generateCRC16(stream: Buffer) {
  let crc = 0;
  stream.forEach(byte => {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      const carry = crc & 1;
      crc >>>= 1;
      if (carry == 1) crc ^= 0xa001;
    }
  });
  return crc;
}
