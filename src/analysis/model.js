// @flow

const tf = require("@tensorflow/tfjs-node");

const EPOCHS = 200;
const BATCH_SIZE = 32;

export function getModel() {
  const model = tf.sequential();

  model.add(tf.layers.dense({ inputShape: [1], units: 1 }));
  model.add(tf.layers.dense({ units: 5, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1 }));
  model.fit();
  return model;
}

export async function trainModel(
  model: tf.Sequential,
  inputs: tf.Tensor,
  labels: tf.Tensor
) {
  model.compile({
    optimizer: tf.train.adam(),
    loss: mseAndInterceptLoss
  });

  return await model.fit(inputs, labels, {
    batchSize: BATCH_SIZE,
    epochs: EPOCHS,
    shuffle: true
  });
}

function mseAndInterceptLoss(yTrue, yPred) {
  return tf.tidy(() => {
    return tf.metrics.meanSquaredError(yTrue, yPred);
  });
}
