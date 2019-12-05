// @flow

import config from "./config";
import cors from "cors";
import express from "express";
import graphqlHTTP from "express-graphql";
import schema from "./api/schema";
import storage from "node-persist";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use("/", (req, res) => {
  storage
    .init()
    .then(() => storage.getItem("queries"))
    .then(queries => (Array.isArray(queries) ? queries : []))
    .then(
      queries =>
        Object.keys(req.query).length > 0 &&
        storage.setItem("queries", [...queries, req.query])
    )
    .then(() => storage.getItem("queries"))
    .then(queries => res.status(200).json(queries))
    .catch(console.log);
});

app.use(
  "/api",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(port, () =>
  console.log(`EnRoute Platform successfully started at port ${port}.`)
);
