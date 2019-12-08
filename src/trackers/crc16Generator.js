// @flow

export default function generateCRC16(stream: Buffer) {
  let crc = 0;
  stream
    .reverse()
    .slice(0)
    .forEach(byte => {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        const carry = crc & 1;
        crc >> 1;
        if (carry == 1) crc ^= 0xa001;
      }
    });
  return crc;
}
