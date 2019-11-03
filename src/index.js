// @flow

import config from "./config";
import cors from "cors";
import express from "express";
import { getVehiclePosition } from "./simulator";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get("/", (req, res) => {
  getVehiclePosition()
    .then(position => res.status(200).json(position))
    .catch(error => res.status(500).json(error));
});

app.listen(port, () => console.log(`EnRoute Platform successfully started.`));
