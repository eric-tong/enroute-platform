// @flow

import { AVL_COLUMNS } from "../resolvers/AvlResolver";
import database from "../database/database";
import { insertBusStopVisitFromAvl } from "../resolvers/BusStopVisitResolver";

async function reinsert() {
  const GET_AVL_IN_PAST_HOUR_WITH_NO_TRIP = `
  SELECT ${AVL_COLUMNS} FROM avl 
    WHERE EXTRACT(epoch FROM now()) - EXTRACT(epoch FROM timestamp) <= 6000 
    AND id NOT IN (SELECT avl_id FROM avl_trip ORDER BY avl_id DESC LIMIT 5000)
  `;
  database
    .query<AVL>(GET_AVL_IN_PAST_HOUR_WITH_NO_TRIP)
    .then(results => results.rows)
    .then(avls => Promise.all(avls.map(insertBusStopVisitFromAvl)));
}
