// tv-shot/shot.js
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SYMBOL = process.env.SYMBOL || 'BINANCE:BTCUSDT';
const TF      = process.env.TF || '240';            // 240 / 15 / 1D
const CORE    = process.env.CORE || SYMBOL.replace(/^BINANCE:/,'');
const TV_URL  = process.env.TV_URL || 'https://<ВАШ_ЛОГИН>.github.io/tv-shot/'; // см. ниже
const OUTDIR  = process.env.OUTDIR || 'shots';
const WIDTH   = 1400;
const HEIGHT  = 900;

const url = new URL(TV_URL);
url.searchParams.set('symbol', SYMBOL);
url.searchParams.set('tf', TF);

const fname = `${CORE}_${TF}.png`;
fs.mkdirSync(OUTDIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'], headless: true });
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
  const page = await context.newPage();

  console.log('Open:', url.toString());
  await page.goto(url.toString(), { waitUntil: 'networkidle' });

  // ждём, пока загрузится iframe виджета
  const iframeHandle = await page.waitForSelector('iframe[src*="tradingview"]', { timeout: 30000 });
  const frame = await iframeHandle.contentFrame();

  // небольшой запас времени на отрисовку свечей
  await page.waitForTimeout(2500);

  // Скриншот всего виджета (iframe). Можно заменить на элемент по селектору.
  const bbox = await iframeHandle.boundingBox();
  await page.screenshot({
    path: path.join(OUTDIR, fname),
    clip: bbox ?? undefined,
    fullPage: !bbox
  });

  console.log('Saved:', path.join(OUTDIR, fname));
  await browser.close();
})();
