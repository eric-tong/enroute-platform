// @flow

import type { AVL } from "./AvlResolver";
import database from "../database/database";

export type IO = {|
  name: string,
  value: number
|};

const GET_IO_WITH_AVL_ID = `
SELECT io_names.value AS name, io.value 
  FROM io INNER JOIN io_names ON io.id = io_names.id 
  WHERE io.avl_id = $1
`;

export function getIoFromAvl(avl: AVL) {
  return database
    .query<IO>(GET_IO_WITH_AVL_ID, [avl.id])
    .then(results => results.rows);
}
