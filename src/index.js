// @flow

import express from "express";
import storage from "node-persist";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Hello World!"));
app.get("/location", async (req, res) => {
  await storage.init({});

  Object.entries(req.query).forEach(async ([key, value]) => {
    await storage.setItem(key, value);
    console.log(key, value);
  });
  return res.send(await storage.values());
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
