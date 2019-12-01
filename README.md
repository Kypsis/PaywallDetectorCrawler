# Delfi/Postimees paywall article detector backend

Backend for Chrome Extension that removes/hides/changes opacity of paywalled links on the main page. Scrapes main page using Puppeteer as headless browser and Axios requests. Initial footprint populating empty DynamoDB table is quite large (ca 500 links), afterwards scrapes roughly 0-10 new links every 5-7 minutes. Written in Node and utilizing AWS EC2 and DynamoDB.

## Endpoints

http://ec2-18-185-111-192.eu-central-1.compute.amazonaws.com:3000/delfi

http://ec2-18-185-111-192.eu-central-1.compute.amazonaws.com:3000/postimees
