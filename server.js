const express = require("express");
const port = process.env.PORT || 3000;
const app = express();

app.get("/", (req, res) => {
  res.send({
    Output: "Hello World! Test!!"
  });
});

app.post("/", (req, res) => {
  res.send({
    Output: "Hello World!"
  });
});

app.listen(port);
module.exports = app;
