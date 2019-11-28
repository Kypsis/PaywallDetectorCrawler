const puppeteer = require("puppeteer");
const axios = require("axios");
const AWS = require("aws-sdk");

AWS.config.loadFromPath("./config.json");
//AWS.config.update({ region: "eu-central-1" });

const docClient = new AWS.DynamoDB.DocumentClient();

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

const scraper = async () => {
  let seenLinks = [];

  try {
    docClient
      .scan({
        TableName: "DelfiPaywallLinks"
      })
      .eachPage((err, data, done) => {
        seenLinks = data.Items;
        //done();
      });
  } catch (error) {
    null;
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://delfi.ee");

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
    const uniqueLinks = [...new Set(mainHrefs)];
    console.log("Unique links on mainpage: ", uniqueLinks.length);

    const newLinks = uniqueLinks.filter(
      item => seenLinks.map(link => link.Links).indexOf(item.Links) == -1
    );
    console.log("Previously seen links: ", seenLinks.length);
    console.log("New links: ", newLinks.length);

    console.log(
      "Paywalled links: ",
      seenLinks.filter(link => link.Paywalled === true).length
    );
    console.log(seenLinks);

    await browser.close();
  } catch (error) {
    console.log(error);
  }
};

scraper();
