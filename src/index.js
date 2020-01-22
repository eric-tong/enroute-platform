// @flow

import "./service/config";
import "./service/serviceWorker";

import cors from "cors";
import express from "express";
import graphqlHTTP from "express-graphql";
import schema from "./graphql/GraphQLSchema";
import storage from "node-persist";
import { updateVehicleStatus } from "./vehicleStatus/VehicleStatusUpdater";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use(
  "/",
  graphqlHTTP({
    schema: schema,
    graphiql: true
  })
);

app.listen(port, () =>
  console.log(`EnRoute Platform successfully started at port ${port}.`)
);
