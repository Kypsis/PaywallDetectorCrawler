const test = [
  { Links: "https://shoo.ee/", Paywalled: false },
  { Links: "https://banana.ee/", Paywalled: false },
  { Links: "https://www.joe.ee/", Paywalled: true }
];

//const uniqueLinks = [...new Map(array.map(item => [item.url, item])).values()];

/* const newInnerLinks = uniqueLinks.filter(
  item => savedLinks.map(link => link.url).indexOf(item.url) == -1
); */

// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
// Set the region
AWS.config.loadFromPath("./config.json");

// Create the DynamoDB service object
var docClient = new AWS.DynamoDB.DocumentClient();

let ttl = Math.round(Date.now() / 1000) + 60;

var params = {
  TableName: "PaywallLinks",
  Item: {
    Links: "https://delfi.ee/sussid",
    Paywalled: true
    //TTL: ttl
  }
};

/* var params = {
  RequestItems: {
    PaywallLinks: test
  }
}; */
// Call DynamoDB to add the item to the table
docClient.put(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
});

/* var params = {
  TableName: "PaywallLinks"
};

// Call DynamoDB to read the item from the table
try {
  docClient.scan(params).eachPage((err, data, done) => {
    console.log(data.Items);
    //done();
  });
} catch (error) {
  null;
} */
