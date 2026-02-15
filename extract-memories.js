#!/usr/bin/env node
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Load minimal extract page (same origin = same localStorage as index.html)
  await page.goto('http://localhost:9999/extract-memories.html', { waitUntil: 'domcontentloaded', timeout: 5000 });
  
  const memories = await page.evaluate(() => {
    const mems = [];
    Object.keys(localStorage)
      .filter(k => k.startsWith('memory:'))
      .forEach(k => {
        mems.push(JSON.parse(localStorage.getItem(k)));
      });
    return mems;
  });
  
  console.log(JSON.stringify(memories, null, 2));
  await browser.close();
})();
