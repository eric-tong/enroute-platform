// @flow

const tf = require("@tensorflow/tfjs-node");

const EPOCHS = 50;
export const BATCH_SIZE = 32;

export function getModel() {
  const model = tf.sequential();

  model.add(tf.layers.dense({ inputShape: [1], units: 1 }));
  model.add(tf.layers.dense({ units: 200, activation: "relu" }));
  model.add(tf.layers.dense({ units: 5, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1 }));

  return model;
}

export async function trainModel(
  model: tf.Sequential,
  inputs: tf.Tensor,
  labels: tf.Tensor
) {
  model.compile({
    optimizer: tf.train.adam(),
    loss: mseAndInterceptLoss,
    metrics: ["mse"]
  });

  return await model.fit(inputs, labels, {
    batchSize: BATCH_SIZE,
    epochs: EPOCHS,
    shuffle: false
  });
}

function mseAndInterceptLoss(yTrue, yPred) {
  return tf.tidy(() => {
    const labels = yTrue.slice(1);
    const predictions = yPred.slice(1);
    const yIntercept = yPred.slice(0, 1);

    const interceptLoss = yIntercept.mul(yIntercept).mul(4);
    return tf.metrics.meanSquaredError(labels, predictions).add(interceptLoss);
  });
}
