import { chromium } from 'playwright';

const TV_URL = process.env.TV_URL;           // https://chirlickax.github.io/tv-shot/
const SYMBOL = process.env.SYMBOL || 'BINANCE:ETHUSDT';
const CORE   = process.env.CORE   || 'ETHUSDT';
const TF     = (process.env.TF || '15').trim(); // '15' | '240' | '1D'

const outName = `${CORE}_${TF}.png`;
const url = `${TV_URL}?symbol=${encodeURIComponent(SYMBOL)}&tf=${encodeURIComponent(TF)}`;

console.log('[shot] URL:', url, '→', outName);

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto(url, { waitUntil: 'networkidle' });
// ждём пока TradingView виджет отметится готовым (флаг в index.html)
await page.waitForFunction(() => window.__TV_READY__ === true, { timeout: 30000 });

// небольшой доп.таймаут чтобы свечи перерисовались
await page.waitForTimeout(800);

const chart = await page.$('#chart-root');
if (!chart) throw new Error('chart-root not found');

await chart.screenshot({ path: outName });
await browser.close();

console.log('[shot] saved:', outName);
