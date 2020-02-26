// @flow

const tf = require("@tensorflow/tfjs-node");

const EPOCHS = 50;
const BATCH_SIZE = 64;

export function getModel() {
  const model = tf.sequential();

  model.add(tf.layers.dense({ inputShape: [2], units: 1 }));
  model.add(tf.layers.dense({ units: 200, activation: "relu" }));
  model.add(tf.layers.dense({ units: 50, activation: "relu" }));
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
    loss: tf.losses.meanSquaredError,
    metrics: ["mse"]
  });

  return await model.fit(inputs, labels, {
    batchSize: BATCH_SIZE,
    epochs: EPOCHS,
    shuffle: true
  });
}
