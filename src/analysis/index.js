// @flow

import "../service/config";

import { MAX_DELTA, MAX_DISTANCE, getData } from "./data";
import { getModel, trainModel } from "./model";

import ObjectsToCsv from "objects-to-csv";
import { plot } from "nodeplotlib";

const tf = require("@tensorflow/tfjs-node");

const MODEL_PATH = `file://${__dirname}/model-split-training-trip`;

main(10);

async function main(tripId: number) {
  await trainAndSaveModel(tripId);
  await validateModel(tripId);
}

async function trainAndSaveModel(tripId: number) {
  const data = await getData(tripId);
  const model = getModel();
  await trainModel(model, data.training.input, data.training.label);
  model.save(`${MODEL_PATH}-${tripId}`);
}

async function validateModel(tripId: number) {
  const data = await getData(tripId);
  const model = await loadModel(`${MODEL_PATH}-${tripId}`);

  const testTensor = tf.linspace(0, 1, 100).reshape([100, 1]);
  const prediction = await model.predict(testTensor);

  const predictedDelta = prediction
    .mul(MAX_DELTA)
    .div(60)
    .dataSync();
  const distance = testTensor.mul(MAX_DISTANCE).dataSync();

  const trainingPlot = {
    x: Array.from(data.training.input.mul(MAX_DISTANCE).dataSync()),
    y: Array.from(
      data.training.label
        .mul(MAX_DELTA)
        .div(60)
        .dataSync()
    ),
    type: "scatter",
    mode: "markers"
  };
  const predictionPlot = {
    x: Array.from(distance),
    y: Array.from(predictedDelta),
    type: "scatter",
    mode: "markers"
  };

  plot([trainingPlot, predictionPlot]);
}

async function loadModel(path: string) {
  return await tf.loadLayersModel(path + "/model.json");
}
