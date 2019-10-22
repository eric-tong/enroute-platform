// @flow

import express from "express";
import storage from "node-persist";

const app = express();
const port = process.env.PORT || 3000;

const key = "locations";

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/locations/:action", async (req, res) => {
  await storage.init({});
  switch (req.params.action) {
    case "clear":
      await storage.clear();
      break;
    case "new":
      const locations = (await storage.getItem(key)) || [];
      console.log(req.query[key]);
      const newLocations = JSON.parse(req.query[key]).payload;
      await storage.updateItem(key, [...locations, ...newLocations]);
      break;
  }
  res.send(await storage.getItem(key));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
