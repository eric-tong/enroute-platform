// @flow

import "../service/config";

import { MAX_DELTA, TEST_DATASET_SIZE, getData } from "./data";
import { getModel, trainModel } from "./model";

import ObjectsToCsv from "objects-to-csv";

const tf = require("@tensorflow/tfjs-node");

const MODEL_PATH = `file://${__dirname}/model-${new Date().valueOf()}`;

main();

async function main() {
  await trainAndSaveModel();
  await testModel();
}

async function trainAndSaveModel() {
  console.log(MODEL_PATH);
  const data = await getData();
  const model = getModel();
  await trainModel(model, data.training.input, data.training.label);
  model.save(MODEL_PATH);
}

async function testModel() {
  const data = await getData();
  const model = await loadModel();

  const testTensor = data.testing;
  const prediction = await model.predict(testTensor.input);

  const predictedDelta = prediction
    .mul(MAX_DELTA)
    .div(60)
    .dataSync();
  const actualDelta = await testTensor.label
    .mul(MAX_DELTA)
    .div(60)
    .dataSync();
  const loss =
    prediction
      .sub(testTensor.label)
      .mul(MAX_DELTA)
      .div(60)
      .dataSync()
      .reduce((sum, val) => sum + Math.abs(val), 0) / TEST_DATASET_SIZE;

  console.log({ predictedDelta, actualDelta, loss });

  const csvData = Array.from(actualDelta).map((actual, i) => ({
    actual,
    predicted: predictedDelta[i],
    final: actual - predictedDelta[i]
  }));

  //   await new ObjectsToCsv(csvData).toDisk(
  //     `./data/delta-${new Date().valueOf()}.csv`
  //   );
}

async function loadModel() {
  return await tf.loadLayersModel(`${MODEL_PATH}/model.json`);
}

async function saveToCSV(object: any) {}
