const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const consoleLogs = [];
  const consoleErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    const loc = msg.location();
    if (msg.type() === 'error') consoleErrors.push({ text, url: loc?.url });
    else consoleLogs.push(text);
  });
  page.on('requestfailed', req => consoleErrors.push({ type: 'requestfailed', url: req.url() }));

  await page.goto('http://localhost:8001/carousel.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot
  await page.screenshot({ path: 'carousel-inspect-screenshot.png' });
  console.log('Screenshot saved to carousel-inspect-screenshot.png\n');

  // 1. HTML structure - photo > img + gloss + grain
  const structure = await page.evaluate(() => {
    const card = document.querySelector('.card');
    if (!card) return { error: 'No .card found' };
    
    const photo = card.querySelector('.photo');
    if (!photo) return { error: 'No .photo found', cardHTML: card.innerHTML };
    
    const img = photo.querySelector('img');
    const gloss = photo.querySelector('.gloss');
    const grain = photo.querySelector('.grain');
    
    return {
      hasPhoto: !!photo,
      hasImg: !!img,
      hasGloss: !!gloss,
      hasGrain: !!grain,
      photoChildren: Array.from(photo.children).map(c => ({ tag: c.tagName, class: c.className })),
      structure: `photo has ${photo.children.length} children: ${Array.from(photo.children).map(c => c.tagName + (c.className ? '.' + c.className : '')).join(', ')}`
    };
  });
  console.log('=== HTML STRUCTURE ===');
  console.log(JSON.stringify(structure, null, 2));

  // 2. card::before pseudo-element
  const beforeStyles = await page.evaluate(() => {
    const card = document.querySelector('.card');
    if (!card) return null;
    
    const styles = window.getComputedStyle(card, '::before');
    return {
      content: styles.content,
      display: styles.display,
      position: styles.position,
      opacity: styles.opacity,
      borderRadius: styles.borderRadius,
      background: styles.background ? styles.background.substring(0, 80) + '...' : styles.background,
      pointerEvents: styles.pointerEvents,
      inset: styles.inset || styles.top + ' ' + styles.right + ' ' + styles.bottom + ' ' + styles.left
    };
  });
  console.log('\n=== CARD::BEFORE PSEUDO-ELEMENT ===');
  console.log(JSON.stringify(beforeStyles, null, 2));

  // 3. .gloss computed styles
  const glossStyles = await page.evaluate(() => {
    const gloss = document.querySelector('.gloss');
    if (!gloss) return { error: 'No .gloss element found' };
    
    const s = window.getComputedStyle(gloss);
    return {
      display: s.display,
      position: s.position,
      opacity: s.opacity,
      mixBlendMode: s.mixBlendMode,
      borderRadius: s.borderRadius,
      pointerEvents: s.pointerEvents,
      background: s.background ? s.background.substring(0, 120) + '...' : s.background,
      inset: s.inset || (s.top + ' ' + s.right + ' ' + s.bottom + ' ' + s.left)
    };
  });
  console.log('\n=== .GLOSS COMPUTED STYLES ===');
  console.log(JSON.stringify(glossStyles, null, 2));

  // 4. .grain computed styles
  const grainStyles = await page.evaluate(() => {
    const grain = document.querySelector('.grain');
    if (!grain) return { error: 'No .grain element found' };
    
    const s = window.getComputedStyle(grain);
    return {
      display: s.display,
      position: s.position,
      opacity: s.opacity,
      mixBlendMode: s.mixBlendMode,
      borderRadius: s.borderRadius,
      pointerEvents: s.pointerEvents,
      background: s.background ? s.background.substring(0, 120) + '...' : s.background,
      inset: s.inset || (s.top + ' ' + s.right + ' ' + s.bottom + ' ' + s.left)
    };
  });
  console.log('\n=== .GRAIN COMPUTED STYLES ===');
  console.log(JSON.stringify(grainStyles, null, 2));

  // 5. Console errors
  console.log('\n=== CONSOLE ERRORS ===');
  console.log(consoleErrors.length ? consoleErrors : 'None');
  console.log('\n=== CONSOLE LOGS (first 5) ===');
  console.log(consoleLogs.slice(0, 5));

  await browser.close();
})();
