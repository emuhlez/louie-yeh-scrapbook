const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport for consistent screenshots
  await page.setViewport({ width: 1200, height: 800 });

  // 1. Navigate to index
  await page.goto('http://localhost:8001/index.html', { waitUntil: 'networkidle0' });
  
  // 2. Wait for landing page to load (title animation)
  await new Promise(r => setTimeout(r, 2000));
  
  // 3. Click on the title to enter scrapbook
  await page.click('#landingTitle');
  
  // 4. Wait for carousel to load (fade out + render + layout)
  await new Promise(r => setTimeout(r, 3500));
  
  // 5. Take screenshot
  await page.screenshot({ path: 'index-carousel-screenshot.png' });
  console.log('Screenshot saved to index-carousel-screenshot.png\n');

  // 6. Check for gloss, grain, card overlay and report
  const report = await page.evaluate(() => {
    const card = document.querySelector('.carousel-card');
    if (!card) return { error: 'No carousel card found' };
    
    const photo = card.querySelector('.photo');
    const gloss = photo?.querySelector('.gloss');
    const grain = photo?.querySelector('.grain');
    
    const beforeStyles = card ? window.getComputedStyle(card, '::before') : null;
    
    return {
      carouselVisible: !!document.querySelector('.carousel-stage'),
      cardsCount: document.querySelectorAll('.carousel-card').length,
      hasGloss: !!gloss,
      hasGrain: !!grain,
      cardBeforeContent: beforeStyles?.content,
      cardBeforeOpacity: beforeStyles?.opacity,
      glossOpacity: gloss ? window.getComputedStyle(gloss).opacity : null,
      grainOpacity: grain ? window.getComputedStyle(grain).opacity : null,
    };
  });
  
  console.log('=== REPORT ===');
  console.log(JSON.stringify(report, null, 2));

  await browser.close();
})();
