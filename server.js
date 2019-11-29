const express = require("express");
const app = express();
const AWS = require("aws-sdk");
const scraper = require("./scraper");

//AWS.config.loadFromPath("./config.json");
AWS.config.update({ region: "eu-central-1" });

const docClient = new AWS.DynamoDB.DocumentClient();

// Scrape Delfi and Postimees every 5-7 minutes
setInterval(() => {
  scraper("https://delfi.ee", "DelfiPaywallLinks");
  console.log("Scraping Delfi ", new Date());
}, /* 300000 */ 60000 + Math.floor(Math.random() * 120000));

setInterval(() => {
  scraper("https://postimees.ee", "PostimeesPaywallLinks");
  console.log("Scraping Postimees ", new Date());
}, /* 300000 */ 60000 + Math.floor(Math.random() * 120000));

app.get("/delfi", (req, res) => {
  try {
    docClient
      .scan({
        TableName: "DelfiPaywallLinks"
      })
      .eachPage((err, data, done) => {
        res.send(data.Items);
        //done();
      });
  } catch (error) {
    null;
  }
});

app.get("/postimees", (req, res) => {
  try {
    docClient
      .scan({
        TableName: "PostimeesPaywallLinks"
      })
      .eachPage((err, data, done) => {
        res.send(data.Items);
        //done();
      });
  } catch (error) {
    null;
  }
});

app.listen(process.env.PORT || 3000);
module.exports = app;
