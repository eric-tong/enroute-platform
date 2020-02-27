// @flow

import "../service/config";

import { MAX_DELTA, getData } from "./data";
import { getModel, trainModel } from "./model";

import ObjectsToCsv from "objects-to-csv";

const tf = require("@tensorflow/tfjs-node");

const MODEL_PATH = `file://${__dirname}/model-split-training-trip-10-2`;

main();

async function main() {
  await trainAndSaveModel();
  await validateModel();
}

async function trainAndSaveModel() {
  const data = await getData();
  const model = getModel();
  await trainModel(model, data.training.input, data.training.label);
  model.save(MODEL_PATH);
}

async function validateModel() {
  const data = await getData();
  const model = await loadModel();

  const testTensor = data.validation;
  const prediction = await model.predict(testTensor.input);

  const predictedDelta = prediction
    .mul(MAX_DELTA)
    .div(60)
    .dataSync();
  const distance = testTensor.input.dataSync();
  const actualDelta = testTensor.label
    .mul(MAX_DELTA)
    .div(60)
    .dataSync();
  const loss =
    prediction
      .sub(testTensor.label)
      .mul(MAX_DELTA)
      .div(60)
      .dataSync()
      .reduce((sum, val) => sum + Math.abs(val), 0) / predictedDelta.length;

  const csvData = Array.from(actualDelta).map((actual, i) => ({
    distance: distance[i],
    actual,
    predicted: predictedDelta[i],
    final: actual - predictedDelta[i]
  }));
  console.log(
    csvData.map(csv => [csv.distance, csv.actual, csv.predicted, csv.final])
  );

  await new ObjectsToCsv(csvData).toDisk(
    `./data/delta-${new Date().valueOf()}.csv`
  );
}

async function loadModel() {
  return await tf.loadLayersModel(`${MODEL_PATH}/model.json`);
}

async function saveToCSV(object: any) {}
