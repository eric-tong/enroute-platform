// @flow

const tf = require("@tensorflow/tfjs");

const MAX_DISTANCE = 10000;
const MAX_DELTA = 600;

export default async function predictDelta(tripId: number, distance: number) {
  const model = await getModel(tripId).catch(error => {
    console.error(error);
    return null;
  });
  if (!model) return 0;

  const input = Math.min(1, distance / MAX_DISTANCE);
  const prediction = await model.predict(tf.tensor1d([input])).dataSync()[0];
  const delta = Math.min(1, Math.max(-1, prediction)) * MAX_DELTA;
  return delta;
}

async function getModel(tripId: number) {
  return await tf.loadLayersModel(
    `file://${process.env.MODELS_PATH ?? ""}/trip-${tripId}/model.json`
  );
}
