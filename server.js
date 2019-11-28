const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const AWS = require("aws-sdk");

AWS.config.loadFromPath("./config.json");
//AWS.config.update({ region: "eu-central-1" });

const docClient = new AWS.DynamoDB.DocumentClient();

// Call DynamoDB to read the item from the table

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

app.listen(port);
module.exports = app;
