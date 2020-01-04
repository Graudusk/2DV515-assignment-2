const express = require("express");
const app = express();
const port = 1337;
const path = require("path");
const kmeans = require("./models/kmeans");
const routes = require("./routes/routes.js");

app.get("/cluster", async (req, res) => {
  const blogs = await kmeans.getBlogs();
  const data = await kmeans.kMeans(blogs);
  res.json(data);
  res.end(JSON.stringify(data, null, 2));
});

app.get("/test", async (req, res) => {
  const fs = require("fs");
  const dbDir = __dirname + "/db/";
  const data = await fs.promises.readFile(
    dbDir + "test.json",
    "utf8",
    async function(err, csvData) {
      return await JSON.parse(csvData);
    }
  );
  res.json(JSON.parse(data));
  res.end(JSON.stringify(data, null, 2));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
