// tv-shot/shot.js
const { chromium } = require('playwright');

(async () => {
  try {
    const TV_URL  = process.env.TV_URL;                 // напр. https://chirlickax.github.io/tv-shot/
    const SYMBOL  = process.env.SYMBOL;                 // напр. BINANCE:BTCUSDT
    const TFS_CSV = process.env.TFS || '240,15,1D';     // "240,15,1D"
    const CORE    = (SYMBOL || '').split(':').pop();    // BTCUSDT

    if (!TV_URL || !SYMBOL) {
      throw new Error('TV_URL и SYMBOL обязательны');
    }

    const browser = await chromium.launch({ args: ['--no-sandbox'], headless: true });
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();

    const tfs = TFS_CSV.split(',').map(s => s.trim()).filter(Boolean);

    for (const tf of tfs) {
      // Ссылка вида: https://.../tv-shot/?symbol=BINANCE%3ABTCUSDT&tf=240
      const url = `${TV_URL}?symbol=${encodeURIComponent(SYMBOL)}&tf=${encodeURIComponent(tf)}`;
      console.log('[shot] URL:', url);

      await page.goto(url, { waitUntil: 'networkidle' });

      // Доп. ожидание, чтобы TradingView догрузился
      await page.waitForTimeout(1200);

      // Скриншот
      const file = `${CORE}_${tf}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log('[shot] saved:', file);
    }

    await browser.close();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
