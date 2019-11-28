const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const AWS = require("aws-sdk");

//AWS.config.loadFromPath("./config.json");
AWS.config.update({ region: "eu-central-1" });

const docClient = new AWS.DynamoDB.DocumentClient();

var params = {
  TableName: "PaywallLinks"
};

// Call DynamoDB to read the item from the table

app.get("/", (req, res) => {
  try {
    docClient.scan(params).eachPage((err, data, done) => {
      res.send(data.Items);
      //done();
    });
  } catch (error) {
    null;
  }
});

app.post("/", (req, res) => {
  res.send({
    Output: "Hello World!"
  });
});

app.listen(port);
module.exports = app;
