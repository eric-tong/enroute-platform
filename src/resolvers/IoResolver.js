// @flow

import database from "../database/database";

export function getIoFromAvlId(avlId: number) {
  const GET_IO_WITH_AVL_ID = `
    SELECT io_names.value AS name, io.value 
      FROM io INNER JOIN io_names ON io.id = io_names.id 
      WHERE io.avl_id = $1
  `;

  return database
    .query<IO>(GET_IO_WITH_AVL_ID, [avlId])
    .then(results => results.rows);
}
