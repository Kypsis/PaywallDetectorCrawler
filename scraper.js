const puppeteer = require("puppeteer");
const axios = require("axios");
const AWS = require("aws-sdk");

//AWS.config.loadFromPath("./config.json");
AWS.config.update({ region: "eu-central-1" });

const docClient = new AWS.DynamoDB.DocumentClient();

// Autoscroll function to get lazy loaded content
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// Scraper function utilizing Puppeteer
const scraper = async (pageToScrape, tableName) => {
  let seenLinks = [];

  try {
    docClient
      .scan({
        TableName: tableName
      })
      .eachPage((err, data, done) => {
        seenLinks = data.Items;
        //done();
      });
  } catch (error) {
    null;
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
      dumpio: false
    });
    const page = await browser.newPage();
    await page.goto(pageToScrape);

    await autoScroll(page);

    const mainHrefs = await page.$$eval("a", anchors =>
      anchors
        .map(a => a.href)
        .filter(link =>
          // Get all links containing delfi.ee, postimees.ee etc with regex but
          // exclude them if they contain adform, twitter, facebook, etc
          link.match(
            /^(?=.*(delfi\.ee|postimees\.ee))(?!.*(adform\.net|twitter\.com|facebook\.com|linkedin\.com|mailto|chrome-extension)).+$/g
          )
        )
    );

    // Important that browser.close() is above Promise.all block to avoid zombie
    // browsers crashing server
    await browser.close();

    const uniqueLinks = [...new Set(mainHrefs)];
    console.log("Unique links on mainpage: ", uniqueLinks.length);

    // Get new links by comparing links loaded from DynamoDB to unique hrefs on page
    const newLinks = uniqueLinks.filter(
      item => seenLinks.map(link => link.Url).indexOf(item) == -1
    );
    console.log("Previously seen links: ", seenLinks.length);
    console.log("New links: ", newLinks.length);

    // Might need changing in future if delfi or postimees implements rate limiter
    // Can be replaced with puppeteer going through links one by one (slow)
    Promise.all(
      newLinks.map(async url => {
        return {
          Url: url,
          Paywalled: await axios
            .get(url)
            .then(response =>
              // Test if link is paywalled with regex
              /pyfe-overlay|paywall-component="paywall"|class="paywall-container"/g.test(
                response.data
              )
            )
            .catch(error => null),
          TTL: Math.round(Date.now() / 1000) + 604800
        };
      })
    )
      .then(async results => {
        seenLinks.push(...results);
        results.forEach(link => {
          // Add result into DynamoDB table
          docClient.put(
            {
              TableName: tableName,
              Item: link
            },
            (err, data) => {
              if (err) {
                console.log("Error");
              } else {
                console.log("Success");
              }
            }
          );
        });
        console.log(
          "Paywalled links: ",
          seenLinks.filter(link => link.Paywalled === true).length
        );
      })
      .catch(async err => null);
  } catch (error) {
    console.log(error);
  }
};

module.exports = scraper;
