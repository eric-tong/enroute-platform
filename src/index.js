// @flow

import config from "./config";
import cors from "cors";
import express from "express";
import graphqlHTTP from "express-graphql";
import schema from "./data/schema";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use(
  "/api",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(port, () => console.log(`EnRoute Platform successfully started.`));
