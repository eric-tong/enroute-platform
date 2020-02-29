// @flow

export async function getMedianDelta() {
  const GET_DELTA = `
      SELECT  bus_stop_id, 
              name,
              trip_id,
              scheduled_departure_id, 
              median(extract(epoch from delta)::NUMERIC) as median_delta,
              count(*)
              
        FROM visits_temp 
        WHERE delta IS NOT NULL
        AND skipped IS FALSE
        GROUP BY scheduled_departure_id, bus_stop_id, name, trip_id
        ORDER BY median(extract(epoch from delta)::NUMERIC) DESC
    `;
}
