const fs = require("fs");
const util = require("util");
const csvParse = require("csv-parse");
const csvParsePromise = util.promisify(csvParse);
const dbDir = __dirname + "/../db/";

getMaxWordCount = (data, word) =>
  data.blogs.reduce((max, e) => {
    const { words } = e;
    const val = words[word];

    return max < val ? val : max;
  }, 0);

getMinWordCount = (data, word) =>
  data.blogs.reduce((min, e) => {
    const { words } = e;
    const val = words[word];

    return min > val ? val : min;
  }, 0);

pearson = (blogA, blogB) => {
  let sum1 = 0;
  let sum2 = 0;
  let sum1sq = 0;
  let sum2sq = 0;
  let pSum = 0;
  let n = 0;

  for (const a in blogA) {
    for (const b in blogB) {
      if (a == b) {
        const valA = parseFloat(blogA[a]);
        const valB = parseFloat(blogB[b]);
        sum1 += valA;
        sum2 += valB;

        sum1sq += Math.pow(valA, 2);
        sum2sq += Math.pow(valB, 2);
        pSum += valA * valB;
        n++;
      }
    }
  }

  if (n === 0) {
    return 0;
  }
  const sum2div = sum2 / n;
  const num = pSum - (sum1 * sum2) / n;
  const den = Math.sqrt(
    (sum1sq - Math.pow(sum1, 2) / n) * (sum2sq - Math.pow(sum2, 2) / n)
  );
  return num / den;
};

kMeans = data => {
  const startTime = new Date();
  const maxIterations = 4;
  const words = Object.keys(data.blogs[0].words);
  const n = words.length;
  const centroids = [];
  const K = 4;
  for (let c = 0; c < K; c++) {
    const centroid = { id: c + 1, words: [], blogs: [] };
    for (const word of words) {
      centroid.words[word] =
        Math.floor(Math.random() * getMaxWordCount(data, word)) +
        getMinWordCount(data, word);
    }
    centroids.push(centroid);
  }

  let endTime = new Date();
  let timeDiff = endTime - startTime; //in ms
  console.log(
    `${K} centroids generated in ${Math.round(timeDiff)} milliseconds.`
  );
  for (let i = 0; i < maxIterations; i++) {
    for (const centroid of centroids) {
      centroid.blogs = [];
    }

    // for (const blog of data.blogs.slice(0, 20)) {
    for (const blog of data.blogs) {
      let distance = Number.MAX_VALUE;
      let best = {};

      for (const centroid of centroids) {
        cDistance = pearson(centroid.words, blog.words);
        if (cDistance < distance) {
          best = centroid;
          distance = cDistance;
        }
      }
      best.blogs.push(blog);
    }
    const start = new Date();
    for (const centroid of centroids) {
      for (const word of words) {
        let average = 0;
        for (const blog of centroid.blogs) {
          average += blog.words[word];
        }
        average /= centroid.blogs.length;

        centroid.words[word] = average;
      }
    }
    let end = new Date();
    console.log(end - start);
  }

  endTime = new Date();
  timeDiff = endTime - startTime; //in ms
  // strip the ms
  timeDiff /= 1000;
  console.log(
    `Clusters generated with kMeans algorithm. Ended after ${Math.round(
      timeDiff
    )} seconds.`
  );
  // const clusters = centroids.map(({ blogs }) => blogs.map(({ name }) => name));
  return centroids.reduce((acc, val) => {
    acc[`Cluster ${val.id} (${val.blogs.length})`] = val.blogs.map(
      ({ name }) => name
    );
    return acc;
  }, {});
};

getBlogs = async () => {
  const data = await fs.promises.readFile(
    dbDir + "blogs.csv",
    "utf8",
    async function(err, csvData) {
      return csvData;
    }
  );
  const csvData = (await csvParsePromise(data, {
    columns: true,
    delimiter: ";",
    quote: "",
    trim: true
  })).reduce((accumulator, e) => {
    const { Blog, ...rest } = e;
    accumulator.push({ name: Blog, words: rest });
    return accumulator;
  }, []);
  return { blogs: csvData };
};

module.exports = { getBlogs, getMaxWordCount, getMinWordCount, kMeans };
