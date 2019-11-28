# Delfi/Postimees paywall article detector backend

Backend for Chrome Extension that removes/hides/changes opacity of paywalled links on the main page. Scrapes main page using
Puppeteer for headless browser and Axios requests. Initial footprint populating empty DynamoDB table is quite large, afterwards
scrapes roughly 10 new links every 5-7 minutes. Written in Node and utilizing AWS Codestar CI/CD pipeline, EC2 and DynamoDB.

## Endpoints

http://ec2-3-123-26-209.eu-central-1.compute.amazonaws.com/delfi

http://ec2-3-123-26-209.eu-central-1.compute.amazonaws.com//postimees
