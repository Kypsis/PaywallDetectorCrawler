const puppeteer = require("puppeteer");
const axios = require("axios");

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });
}

let seenLinks = [];

(async () => {
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
    const newLinks = uniqueLinks.filter(
      item => seenLinks.map(link => link.url).indexOf(item.url) == -1
    );
    console.log("New links: ", newLinks.length);

    Promise.all(
      newLinks.map(async url => {
        return {
          url: url,
          paywall: await axios
            .get(url)
            .then(response =>
              // Test if link is paywalled with regex
              /pyfe-overlay|paywall-component="paywall"|class="paywall-container"/g.test(
                response.data
              )
            )
            .catch(error => null)
        };
      })
    )
      .then(results => {
        seenLinks.push(...results);
        console.log(
          "Paywalled links: ",
          seenLinks.filter(link => link.paywall === true).length
        );
      })
      .catch(err => null);

    await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
