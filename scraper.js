const puppeteer = require("puppeteer");
const axios = require("axios");

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 500;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
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

let paywalledLinks = [];

(async () => {
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

  // Loop through main page links and see if paywalled
  for (let link of uniqueLinks) {
    await page.goto(link);

    await autoScroll(page);

    const bodyAsText = await page.evaluate(() => document.body.innerHTML);
    const paywalled = /pyfe-overlay|paywall-component="paywall"|class="paywall-container"/g.test(
      bodyAsText
    );
    console.log({ url: link, paywall: paywalled });

    // Get inner links
    const innerHrefs = await page.$$eval("a", anchors =>
      anchors
        .map(a => a.href)
        .filter(link =>
          link.match(
            /^(?=.*(delfi\.ee|postimees\.ee))(?!.*(adform\.net|twitter\.com|facebook\.com|linkedin\.com|mailto|chrome-extension)).+$/g
          )
        )
    );
    const innerLinks = [...new Set(innerHrefs)];
    console.log(innerLinks.length);

    /* Promise.all(
      innerLinks.map(async url => {
        return {
          url: url,
          paywall: await axios
            .get(url)
            .then(response =>
              /pyfe-overlay|paywall-component="paywall"|class="paywall-container"/g.test(
                response.data
              )
            )

            .catch(error => console.log("error"))
        };
      })
    ).then(results => console.log(results)); */
  }

  await browser.close();
})();
