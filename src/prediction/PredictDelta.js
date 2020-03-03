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

  const prediction = await model.predict(
    tf.tensor1d([distance / MAX_DISTANCE])
  );
  const delta = prediction.dataSync()[0] * MAX_DELTA;
  return delta;
}

async function getModel(tripId: number) {
  return await tf.loadLayersModel(
    `file://${process.env.MODELS_PATH ?? ""}/trip-${tripId}/model.json`
  );
}
