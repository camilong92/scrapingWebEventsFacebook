const fs = require('fs');
const puppeteer = require('puppeteer');
const S = require('string');

function extractItems() {  
  const events = document.querySelectorAll('div ._4dmk > a');
  const items = [];

  for (let event of events) {
    var urlEvent;
    str = event.href;
    var n = str.search("/?ref_page_id=");
    var urlEvent = str.substring(0, n-1);
    items.push(urlEvent);    
  }
  return items;
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  itemTargetCount,
  scrollDelay = 1000,
) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemTargetCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitFor(scrollDelay);
    }
  } catch(e) { }
  return items;
}

(async () => {
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  // Navigate to the demo page.
  await page.goto('https://web.facebook.com/pg/technopolismedellin/events/');

  // Scroll and extract items from the page.
  const items = await scrapeInfiniteScrollItems(page, extractItems, 500);

  // Save extracted items to a file.
  fs.writeFileSync('./href1.txt', items.join('\n') + '\n');

  // Close the browser.
  await browser.close();
  
})();
