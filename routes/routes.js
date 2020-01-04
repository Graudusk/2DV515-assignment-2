const express = require("express");
const router = express.Router();
const kmeans = require("../models/kmeans");
const fetch = require("node-fetch");

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get("/", async (req, res) => {
  let data = {
    title: "KMeans"
  };

  const clusters = await fetch("http://localhost:1337/cluster").then(response =>
    response.json()
  );

  res.render("home", {
    data: { ...data, clusters },
    page: req.url
  });
});

router.get("/test", async (req, res) => {
  let data = {
    title: "KMeans"
  };
  const clusters = await fetch("http://localhost:1337/test").then(response =>
    response.json()
  );
  console.log(clusters);

  res.render("home", {
    data: { ...data, clusters },
    page: req.url
  });
});

module.exports = router;
