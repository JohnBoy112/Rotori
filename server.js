const fs = require("fs");

let valueList = {};
let overpayList = {};
let rapOpList = {};

try {
  valueList = JSON.parse(fs.readFileSync("./value.json", "utf8"));
} catch {
  console.log("No value.json found");
}

try {
  overpayList = JSON.parse(fs.readFileSync("./overpay.json", "utf8"));
} catch {
  console.log("No overpay.json found");
}

try {
  rapOpList = JSON.parse(fs.readFileSync("./rapop.json", "utf8"));
} catch {
  console.log("No rapop.json found");
}

const { analyzeTradeCore } = require("./rotori-core");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let itemData = {};
let nameToItem = {};

const marketCache = new Map();
const MARKET_CACHE_MS = 2 * 60 * 1000;

const thumbnailCache = new Map();
const THUMBNAIL_CACHE_MS = 10 * 60 * 1000;

function normalize(str) {
  return String(str || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}
function rotoriKnownMarketText(value, fallback = "UNKNOWN") {
  const text = String(value || "").replaceAll("_", " ").trim();
  const upper = text.toUpperCase();

  if (!text || upper === "UNKNOWN" || upper === "? UNKNOWN") {
    return fallback;
  }

  return text;
}

function median(arr) {
  if (!arr.length) return 0;

  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function fallbackThumbnailSvg(name = "Limited") {
  const safeName = String(name || "Limited")
    .replace(/[<>&'"]/g, "")
    .slice(0, 18);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#d9eeff"/>
        </linearGradient>
      </defs>
      <rect width="150" height="150" rx="28" fill="url(#g)"/>
      <circle cx="75" cy="58" r="28" fill="#1683ff" opacity="0.18"/>
      <text x="75" y="70" text-anchor="middle" font-size="34" font-family="Arial" font-weight="900" fill="#1683ff">R</text>
      <text x="75" y="106" text-anchor="middle" font-size="13" font-family="Arial" font-weight="800" fill="#10233f">${safeName}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function fetchThumbnailUrl(assetId, name = "Limited") {
  const id = String(assetId || "").trim();

  if (!id) return fallbackThumbnailSvg(name);

  const cached = thumbnailCache.get(id);

  if (cached && Date.now() - cached.time < THUMBNAIL_CACHE_MS) {
    return cached.url;
  }

  try {
    const url =
      `https://thumbnails.roblox.com/v1/assets` +
      `?assetIds=${encodeURIComponent(id)}` +
      `&size=150x150` +
      `&format=Png` +
      `&isCircular=false`;

    const res = await fetch(url);

    if (!res.ok) throw new Error(`Thumbnail HTTP ${res.status}`);

    const json = await res.json();
    const imageUrl = json?.data?.[0]?.imageUrl;

    const finalUrl = imageUrl || fallbackThumbnailSvg(name);

    thumbnailCache.set(id, {
      time: Date.now(),
      url: finalUrl
    });

    return finalUrl;
  } catch {
    const finalUrl = fallbackThumbnailSvg(name);

    thumbnailCache.set(id, {
      time: Date.now(),
      url: finalUrl
    });

    return finalUrl;
  }
}
function parseRecentSalesLoose(html, limit = 120) {
  if (typeof parseRecentSalesUltraLoose === "function") {
    return parseRecentSalesUltraLoose(html, limit);
  }

  return [];
}
function parseRecentSales(html, limit = 120) {
  const tsMarker = '<div class="activity_entry_timestamp';
  const idxs = [];

  let start = 0;

  while (true) {
    const i = html.indexOf(tsMarker, start);

    if (i === -1 || idxs.length >= limit + 1) break;

    idxs.push(i);
    start = i + tsMarker.length;
  }

  const blocks = [];

  for (let j = 0; j < Math.min(limit, idxs.length); j++) {
    const from = idxs[j];
    const to = j + 1 < idxs.length ? idxs[j + 1] : html.length;
    blocks.push(html.slice(from, to));
  }

  const sales = [];

  for (const block of blocks) {
    const salePriceMatch =
      block.match(/<div class="activity_stat_header">Sale Price<\/div>[\s\S]*?<div class="pl-1">(-?[\d,]+)<\/div>/i);

    const oldRapMatch =
      block.match(/<div class="activity_stat_header">Old RAP<\/div>\s*<div class="activity_stat_data">([\d,]+)<\/div>/i);

    const newRapMatch =
      block.match(/<div class="activity_stat_header">New RAP<\/div>\s*<div class="activity_stat_data">([\d,]+)<\/div>/i);

    const timestampMatch =
      block.match(/activity_entry_timestamp[^>]*>(\d+)<\/div>/i);

    if (salePriceMatch && oldRapMatch && newRapMatch && timestampMatch) {
      sales.push({
        salePrice: Number(salePriceMatch[1].replace(/,/g, "")),
        oldRap: Number(oldRapMatch[1].replace(/,/g, "")),
        newRap: Number(newRapMatch[1].replace(/,/g, "")),
        timestamp: Number(timestampMatch[1])
      });
    }
  }

  if (!sales.length) {
  const looseSales = parseRecentSalesLoose(html, limit);

  if (looseSales.length) {
    return looseSales;
  }

  const ultraLooseSales = parseRecentSalesUltraLoose(html, limit);

  if (ultraLooseSales.length) {
    return ultraLooseSales;
  }
}

return sales;
}

function demandFromSales(sales) {
  const timestamps = (sales || [])
    .map(s => Number(s.timestamp || 0))
    .filter(Boolean)
    .sort((a, b) => b - a);

  // UNKNOWN means Rotori could not read enough sales.
  if (timestamps.length < 2) return "UNKNOWN";

  const newest = timestamps[0];
  const oldest = timestamps[timestamps.length - 1];

  const spanDays = Math.max(
    1,
    (newest - oldest) / (24 * 60 * 60)
  );

  const salesPerDay = timestamps.length / spanDays;

  const last7Cutoff = newest - 7 * 24 * 60 * 60;
  const last14Cutoff = newest - 14 * 24 * 60 * 60;

  const sales7d = timestamps.filter(t => t >= last7Cutoff).length;
  const sales14d = timestamps.filter(t => t >= last14Cutoff).length;

  // Use actual sales/day as the main demand check.
  // 0.83/day should be LOW, not MEDIUM.
  if (salesPerDay >= 12 && sales7d >= 50) return "ULTRA HIGH";
  if (salesPerDay >= 4 && sales7d >= 20) return "HIGH";
  if (salesPerDay >= 1.5 && sales14d >= 15) return "MEDIUM";

  return "LOW";
}

function trendFromSales(sales, demand) {
  const newRaps = sales
    .map(s => s.newRap)
    .filter(Boolean)
    .slice(0, 10);

  if (newRaps.length < 2) return "UNKNOWN";

  const deltas = [];

  for (let i = 0; i < newRaps.length - 1; i++) {
    deltas.push(newRaps[i] - newRaps[i + 1]);
  }

  const positive = deltas.filter(d => d > 0).length;
  const negative = deltas.filter(d => d < 0).length;
  const flat = deltas.filter(d => d === 0).length;
  const total = deltas.length;

  if (positive >= 7) return "INCREASING";
  if (negative >= 7) return "LOWERING";
  if (negative === 6) return "SLIGHTLY LOWERING";

  if (positive / total >= 0.66) return "INCREASING";
  if (negative / total >= 0.66) return "LOWERING";

  if (demand === "LOW" && positive > negative) {
    return "NOT RISING / LOW DEMAND";
  }

  if (flat >= total * 0.5) return "STABLE";

  return "STABLE";
}

function detectProjectedFromSales(sales) {
  if (!sales.length) {
    return {
      projected: false,
      baselineRap: 0
    };
  }

  const oldRaps = sales
    .map(s => s.oldRap)
    .filter(Boolean)
    .sort((a, b) => a - b);

  const baselineRap = oldRaps.length >= 6
    ? median(oldRaps.slice(0, Math.max(1, Math.floor(oldRaps.length * 0.8))))
    : median(oldRaps);

  let projected = false;

  for (const sale of sales) {
    const oldRap = Math.max(1, sale.oldRap || baselineRap || 1);
    const priceRatio = sale.salePrice / oldRap;
    const rapRatio = sale.newRap / oldRap;
    const jump = sale.newRap - sale.oldRap;

    const hugeSale = priceRatio >= 4;
    const hugeRapJump = rapRatio >= 1.6;
    const meaningfulJump = jump >= Math.max(500, oldRap * 0.25);

    if (hugeSale && hugeRapJump && meaningfulJump) {
      projected = true;
      break;
    }
  }

  return {
    projected,
    baselineRap
  };
}
function percentile(nums, p) {
  const arr = (nums || [])
    .filter(v => Number.isFinite(Number(v)) && Number(v) > 0)
    .map(Number)
    .sort((a, b) => a - b);

  if (!arr.length) return 0;

  const idx = Math.max(
    0,
    Math.min(arr.length - 1, Math.floor((arr.length - 1) * p))
  );

  return arr[idx];
}
function getSalePrice(sale = {}) {
  return Number(
    sale.salePrice ||
    sale.price ||
    sale.sale_price ||
    sale.SalePrice ||
    0
  ) || 0;
}

function getOldRap(sale = {}) {
  return Number(
    sale.oldRap ||
    sale.oldRAP ||
    sale.old_rap ||
    sale.OldRAP ||
    0
  ) || 0;
}

function getNewRap(sale = {}) {
  return Number(
    sale.newRap ||
    sale.newRAP ||
    sale.new_rap ||
    sale.NewRAP ||
    0
  ) || 0;
}

function getSaleDateMs(sale = {}) {
  const raw =
    sale.date ||
    sale.created ||
    sale.createdAt ||
    sale.soldAt ||
    sale.time ||
    sale.timestamp;

  const num = Number(raw);

  // Your parser stores timestamps in SECONDS.
  if (Number.isFinite(num) && num > 1000000000 && num < 10000000000) {
    return num * 1000;
  }

  // If it ever stores milliseconds.
  if (Number.isFinite(num) && num >= 10000000000) {
    return num;
  }

  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function shouldIgnoreHyperInflatedBecauseSlowLowDemand(item = {}, sales = [], currentRap = 0, baselineRap = 0) {
  const demand = String(item.demand || "").toUpperCase();
  const salesPerDay = Number(item.salesPerDay || item.recentSalesPerDay || item.salesPerDay90 || 0);

  const lowDemandLike =
    demand.includes("LOW") ||
    demand.includes("VERY LOW") ||
    (salesPerDay > 0 && salesPerDay < 0.35);

  if (!lowDemandLike) return false;
  if (!sales.length || !currentRap || !baselineRap) return false;

  const sorted = [...sales]
    .filter(s => getSalePrice(s) > 0)
    .sort((a, b) => getSaleDateMs(b) - getSaleDateMs(a));

  if (sorted.length < 6) return false;

  const newest = sorted[0];
  const oldest = sorted[sorted.length - 1];

  const newestMs = getSaleDateMs(newest);
  const oldestMs = getSaleDateMs(oldest);
  const spanDays = newestMs && oldestMs
    ? Math.abs(newestMs - oldestMs) / 86400000
    : 0;

  const oldestRap = getOldRap(oldest) || getNewRap(oldest) || baselineRap;
  const latestSale = getSalePrice(newest);

  const rapGrowthPct = oldestRap > 0
    ? (currentRap - oldestRap) / oldestRap
    : 0;

  const latestSaleSupportsCurrentRap =
    latestSale >= currentRap * 0.80 &&
    latestSale <= currentRap * 1.60;

  const recentHighSales = sorted.filter(s => {
    const saleMs = getSaleDateMs(s);
    if (!saleMs || !newestMs) return false;

    const daysAgo = Math.abs(newestMs - saleMs) / 86400000;
    return daysAgo <= 10 && getSalePrice(s) >= baselineRap * 1.80;
  }).length;

  const trulyExtreme =
    currentRap >= baselineRap * 2.0 ||
    latestSale >= baselineRap * 2.25 ||
    recentHighSales >= 2;

  if (trulyExtreme) return false;

  const slowRise =
    spanDays >= 30 &&
    rapGrowthPct <= 0.90 &&
    latestSaleSupportsCurrentRap;

  return slowRise;
}
function detectHyperInflatedFromSales(sales) {
  if (!sales || sales.length < 25) {
    return {
      isHyperInflated: false,
      hyperBaselineRap: 0,
      hyperPeakRap: 0,
      hyperInflationRatio: 0,
      hyperInflationReason: ""
    };
  }

  const cleanSales = sales
    .filter(s =>
      Number.isFinite(Number(s.oldRap)) &&
      Number.isFinite(Number(s.newRap)) &&
      Number.isFinite(Number(s.salePrice)) &&
      Number(s.oldRap) > 0 &&
      Number(s.newRap) > 0 &&
      Number(s.salePrice) > 0
    );

  if (cleanSales.length < 25) {
    return {
      isHyperInflated: false,
      hyperBaselineRap: 0,
      hyperPeakRap: 0,
      hyperInflationRatio: 0,
      hyperInflationReason: ""
    };
  }

  const currentRap = Number(cleanSales[0].newRap || 0);

  // Recent area = what it looks like now.
  const recent = cleanSales.slice(0, 12);

  // Older area = more normal history before the newest pump/noise.
  // This intentionally ignores the newest 20 sales.
  const older = cleanSales.slice(20, 90);

  if (older.length < 10 || !currentRap) {
    return {
      isHyperInflated: false,
      hyperBaselineRap: 0,
      hyperPeakRap: 0,
      hyperInflationRatio: 0,
      hyperInflationReason: ""
    };
  }

  const olderRapPool = older
    .flatMap(s => [Number(s.oldRap), Number(s.newRap)])
    .filter(v => Number.isFinite(v) && v > 0);

  const recentRapPool = recent
    .flatMap(s => [Number(s.oldRap), Number(s.newRap)])
    .filter(v => Number.isFinite(v) && v > 0);

  if (olderRapPool.length < 10 || recentRapPool.length < 6) {
    return {
      isHyperInflated: false,
      hyperBaselineRap: 0,
      hyperPeakRap: 0,
      hyperInflationRatio: 0,
      hyperInflationReason: ""
    };
  }

  const baselineRap = Math.round(median(olderRapPool));
  const recentMedianRap = Math.round(median(recentRapPool));
  const peakRap = Math.max(...cleanSales.slice(0, 35).map(s => Number(s.newRap || 0)));

  const currentRatio = baselineRap > 0 ? currentRap / baselineRap : 0;
  const recentRatio = baselineRap > 0 ? recentMedianRap / baselineRap : 0;
  const peakRatio = baselineRap > 0 ? peakRap / baselineRap : 0;

  // Count how often recent sales are selling below current RAP.
  // Hyper-inflated items often start dumping under their inflated RAP.
  const recentUnderRapSales = recent.filter(s => {
    const salePrice = Number(s.salePrice || 0);
    const oldRap = Number(s.oldRap || 0);
    return oldRap > 0 && salePrice <= oldRap * 0.9;
  }).length;

  // Count recent RAP direction.
  const recentDrops = recent.filter(s => Number(s.newRap) < Number(s.oldRap)).length;

  /*
    Main rule:
    - Current/recent RAP is way above older normal RAP
    - OR peak RAP was extremely above older normal RAP and it is now dumping
    - No demand or size check. This applies to every RAP item.
  */
  const currentlyInflated =
    currentRatio >= 1.55 &&
    recentRatio >= 1.45 &&
    currentRap - baselineRap >= Math.max(120, baselineRap * 0.35);

  const pumpedAndDumping =
  peakRatio >= 1.9 &&
  currentRatio >= 1.35 &&
  (recentDrops >= 5 || recentUnderRapSales >= 5);

// NEW: slow-pump fallback.
// This catches items that inflated gradually over many sales,
// where slice(20, 90) is already too inflated to be a good baseline.
const fullHistoryRapPool = cleanSales
  .slice(0, 120)
  .flatMap(s => [Number(s.oldRap), Number(s.newRap)])
  .filter(v => Number.isFinite(v) && v > 0)
  .sort((a, b) => a - b);

let slowPumpInflated = false;
let finalBaselineRap = baselineRap;
let finalInflationRatio = currentRatio;

if (fullHistoryRapPool.length >= 40) {
  const lowHistoryIndex = Math.floor((fullHistoryRapPool.length - 1) * 0.25);
  const lowHistoryBaseline = Math.round(fullHistoryRapPool[lowHistoryIndex]);

  const slowCurrentRatio =
    lowHistoryBaseline > 0 ? currentRap / lowHistoryBaseline : 0;

  const slowRecentRatio =
    lowHistoryBaseline > 0 ? recentMedianRap / lowHistoryBaseline : 0;

  const slowPeakRatio =
    lowHistoryBaseline > 0 ? peakRap / lowHistoryBaseline : 0;

  slowPumpInflated =
    lowHistoryBaseline > 0 &&
    slowCurrentRatio >= 1.6 &&
    slowRecentRatio >= 1.45 &&
    slowPeakRatio >= 2.0 &&
    peakRap - lowHistoryBaseline >= Math.max(180, Math.round(lowHistoryBaseline * 0.55));

  if (slowPumpInflated) {
    finalBaselineRap = lowHistoryBaseline;
    finalInflationRatio = slowCurrentRatio;
  }
}
// NEW: stability guard.
// If an item has held near its current RAP for a long time,
// do not call it hyper-inflated just because it was lower months ago.
const stableWindow = cleanSales.slice(0, 24);

const stableRapPool = stableWindow
  .flatMap(s => [Number(s.oldRap), Number(s.newRap)])
  .filter(v => Number.isFinite(v) && v > 0);

const stableMedianRap = median(stableRapPool);

const oldEnoughWindow = cleanSales.slice(12, 60);

const oldEnoughRapPool = oldEnoughWindow
  .flatMap(s => [Number(s.oldRap), Number(s.newRap)])
  .filter(v => Number.isFinite(v) && v > 0);

const oldEnoughMedianRap = median(oldEnoughRapPool);

const recentStableNearCurrent =
  stableMedianRap > 0 &&
  Math.abs(stableMedianRap - currentRap) <= Math.max(250, currentRap * 0.12);

const olderAlsoNearCurrent =
  oldEnoughMedianRap > 0 &&
  Math.abs(oldEnoughMedianRap - currentRap) <= Math.max(400, currentRap * 0.16);

const notDumpingFromPeak =
  peakRap > 0 &&
  currentRap >= peakRap * 0.9;
  // NEW: time-based stability guard.
// This prevents false hyper-inflated flags on slow-selling items
// that have held near current RAP for months.
const DAY_SECONDS = 24 * 60 * 60;
const newestTimestamp = Number(cleanSales[0]?.timestamp || 0);

const timeStableSales = newestTimestamp
  ? cleanSales.filter(s => {
      const ts = Number(s.timestamp || 0);
      return ts > 0 && newestTimestamp - ts <= 120 * DAY_SECONDS;
    })
  : [];

const timeStableRapPool = timeStableSales
  .flatMap(s => [Number(s.oldRap), Number(s.newRap)])
  .filter(v => Number.isFinite(v) && v > 0);

const timeStableMedianRap = median(timeStableRapPool);

const timeStablePeakRap = timeStableSales.length
  ? Math.max(...timeStableSales.map(s => Number(s.newRap || 0)))
  : 0;

const enoughTimeStableSales = timeStableSales.length >= 8;

const stableNearCurrentByTime =
  enoughTimeStableSales &&
  timeStableMedianRap > 0 &&
  Math.abs(timeStableMedianRap - currentRap) <= Math.max(500, Math.round(currentRap * 0.14));

const notDumpingRecentlyByTime =
  timeStablePeakRap > 0 &&
  currentRap >= timeStablePeakRap * 0.85;

// If it has held near current RAP in the last ~120 days,
// do not call it hyper-inflated just because older history was lower.
if (stableNearCurrentByTime && notDumpingRecentlyByTime) {
  return {
    isHyperInflated: false,
    hyperBaselineRap: 0,
    hyperPeakRap: peakRap,
    hyperInflationRatio: Number(currentRatio.toFixed(2)),
    hyperInflationReason: ""
  };
}

if (recentStableNearCurrent && olderAlsoNearCurrent && notDumpingFromPeak) {
  return {
    isHyperInflated: false,
    hyperBaselineRap: 0,
    hyperPeakRap: peakRap,
    hyperInflationRatio: Number(currentRatio.toFixed(2)),
    hyperInflationReason: ""
  };
}
const hyperDemandGuess = demandFromSales(cleanSales);

if (
  shouldIgnoreHyperInflatedBecauseSlowLowDemand(
    { demand: hyperDemandGuess },
    cleanSales,
    currentRap,
    finalBaselineRap
  )
) {
  return {
    isHyperInflated: false,
    hyperBaselineRap: 0,
    hyperPeakRap: peakRap,
    hyperInflationRatio: Number(finalInflationRatio.toFixed(2)),
    hyperInflationReason: "Slow low-demand RAP rise, not hyper-inflated."
  };
}

if (currentlyInflated || pumpedAndDumping || slowPumpInflated) {
  return {
    isHyperInflated: true,
    hyperBaselineRap: finalBaselineRap,
    hyperPeakRap: peakRap,
    hyperInflationRatio: Number(finalInflationRatio.toFixed(2)),
    hyperInflationReason:
      `RAP looks hyper-inflated. Current RAP is ${currentRap.toLocaleString()}, safer historical RAP looks closer to ${finalBaselineRap.toLocaleString()}, and recent peak was ${peakRap.toLocaleString()}.`
  };
}

  return {
    isHyperInflated: false,
    hyperBaselineRap: 0,
    hyperPeakRap: peakRap,
    hyperInflationRatio: Number(currentRatio.toFixed(2)),
    hyperInflationReason: ""
  };
}
function rotoriEmptyValuedDropRisk() {
  return {
    dropWatch: false,
    dropEligible: false,
    isDropping: false,
    dropOriginalValue: 0,
    dropAdjustedValue: 0,
    dropValueLoss: 0,
    dropCriticalRapLine: 0,
    dropGuardGap: 0,
    dropHoursCritical: 0,
    dropHoursNeeded: 0,
    dropHoursUntilEligible: 0,
    dropLowSaleDetected: false,
    dropReason: ""
  };
}

function rotoriValueDropStep(value) {
  value = Number(value || 0);

  if (!Number.isFinite(value) || value <= 0) return 0;

  // Fallback only. The real next-lower tier should come from value.json.
  if (value < 10000) return 1000;
  if (value < 50000) return 5000;
  if (value < 100000) return 10000;
  if (value < 500000) return 25000;

  return Math.max(
    50000,
    Math.round((value * 0.1) / 10000) * 10000
  );
}

function rotoriKnownValueTiers() {
  return [...new Set(
    Object.values(valueList || {})
      .map(v => Number(v || 0))
      .filter(v => Number.isFinite(v) && v > 0)
  )].sort((a, b) => b - a);
}

function rotoriNextLowerValue(value) {
  value = Number(value || 0);

  if (!Number.isFinite(value) || value <= 0) return 0;

  // Prefer real known value tiers from value.json.
  // Example: 42,000 -> 40,000, not 37,000.
  const tiers = rotoriKnownValueTiers();
  const nextKnownTier = tiers.find(tier => tier < value);

  if (nextKnownTier) {
    return nextKnownTier;
  }

  // Fallback if value.json somehow has no lower tier.
  const step = rotoriValueDropStep(value);

  if (!step) return 0;

  return Math.max(0, value - step);
}
function rotoriDropGuardGap(adjustedValue) {
  adjustedValue = Number(adjustedValue || 0);

  if (!Number.isFinite(adjustedValue) || adjustedValue <= 0) {
    return 500;
  }

  // Matches:
  // 6,000 tier -> 5,500 line
  // 40,000 tier -> 38,500 line
  return Math.max(
    500,
    Math.round(adjustedValue * 0.0375)
  );
}

function detectValuedDropRiskFromSales(sales, currentValue) {
  const empty = rotoriEmptyValuedDropRisk();

  currentValue = Number(currentValue || 0);

  if (!currentValue || !sales?.length) return empty;

  const cleanSales = sales
    .filter(s =>
      Number.isFinite(Number(s.timestamp)) &&
      Number.isFinite(Number(s.oldRap)) &&
      Number.isFinite(Number(s.newRap)) &&
      Number.isFinite(Number(s.salePrice)) &&
      Number(s.timestamp) > 0 &&
      Number(s.oldRap) > 0 &&
      Number(s.newRap) > 0
    )
    .map(s => ({
      salePrice: Number(s.salePrice),
      oldRap: Number(s.oldRap),
      newRap: Number(s.newRap),
      timestamp: Number(s.timestamp)
    }));

  if (!cleanSales.length) return empty;

    const currentRap = Number(cleanSales[0].newRap || 0);
  const adjustedValue = rotoriNextLowerValue(currentValue);

  if (!currentRap || !adjustedValue || adjustedValue >= currentValue) {
    return empty;
  }

  const guardGap = rotoriDropGuardGap(adjustedValue);
  const criticalRapLine = Math.max(0, adjustedValue - guardGap);

  const originalCriticalGap = Math.max(
    1000,
    Math.round(currentValue * 0.12)
  );

  const criticallyUnderOriginalValue =
    currentValue - currentRap > originalCriticalGap;

  const inDropZone =
    currentRap <= criticalRapLine;

  if (!criticallyUnderOriginalValue || !inDropZone) {
    return {
      ...empty,
      dropOriginalValue: currentValue,
      dropAdjustedValue: adjustedValue,
      dropValueLoss: currentValue - adjustedValue,
      dropCriticalRapLine: criticalRapLine,
      dropGuardGap: guardGap
    };
  }

  const criticalRun = [];

  for (const sale of cleanSales) {
    const wasCritical =
      sale.newRap <= criticalRapLine ||
      sale.oldRap <= criticalRapLine;

    if (!wasCritical) break;

    criticalRun.push(sale);
  }

  const startSale = criticalRun.length
    ? criticalRun[criticalRun.length - 1]
    : cleanSales[0];

  const newestTs = Number(cleanSales[0].timestamp || 0);
  const nowTs = Math.max(
    Math.floor(Date.now() / 1000),
    newestTs
  );

  const startTs = Number(startSale.timestamp || newestTs || 0);

  const hoursCritical = startTs
    ? Math.max(0, (nowTs - startTs) / 3600)
    : 0;

  const lowSaleDetected = criticalRun.some(s => {
    const price = Number(s.salePrice || 0);

    // Negative sale, 0 sale, or anything under/equal 1,000 gets the longer guard.
    return price <= 1000;
  });

  const hoursNeeded = lowSaleDetected ? 48 : 24;
  const hoursUntilEligible = Math.max(0, hoursNeeded - hoursCritical);
  const dropEligible = hoursCritical >= hoursNeeded;

  return {
    dropWatch: true,
    dropEligible,
    isDropping: dropEligible,

    dropOriginalValue: currentValue,
    dropAdjustedValue: adjustedValue,
    dropValueLoss: currentValue - adjustedValue,

    dropCriticalRapLine: criticalRapLine,
    dropGuardGap: guardGap,

    dropHoursCritical: Math.round(hoursCritical * 10) / 10,
    dropHoursNeeded: hoursNeeded,
    dropHoursUntilEligible: Math.ceil(hoursUntilEligible),

    dropLowSaleDetected: lowSaleDetected,

    dropReason: dropEligible
      ? `Value item has stayed in the critical drop zone for ${Math.round(hoursCritical * 10) / 10} hours. Rotori treats it as ${adjustedValue.toLocaleString()} instead of ${currentValue.toLocaleString()}.`
      : `Value item is in the critical drop zone, but it needs about ${Math.ceil(hoursUntilEligible)} more hour(s) before Rotori treats it as a drop.`
  };
}

async function fetchMarketSummary(itemId, knownValue = 0) {
  const cacheKey = String(itemId);
  const cached = marketCache.get(cacheKey);

  if (cached && Date.now() - cached.time < MARKET_CACHE_MS) {
    return cached.data;
  }

  const fallback = {
    demand: "UNKNOWN",
    trend: "UNKNOWN",
    projected: false,
    baselineRap: 0,
    salesCount: 0
  };

  try {
    const res = await fetch(`https://www.rolimons.com/itemsales/${itemId}`);

    if (!res.ok) {
      marketCache.set(cacheKey, { time: Date.now(), data: fallback });
      return fallback;
    }

    const html = await res.text();
    if (String(itemId) === "114706745345742") {
  console.log("FROSTY HTML LENGTH:", html.length);
  console.log("HAS SALE PRICE:", html.includes("Sale Price"));
  console.log("HAS OLD RAP:", html.includes("Old RAP"));
  console.log("HAS ACTIVITY CLASS:", html.includes("activity_entry_timestamp"));
  console.log("FROSTY HTML SAMPLE:", html.slice(0, 1000));
}
    const sales = parseRecentSales(html, 120);
    if (String(itemId) === "114706745345742") {
  console.log("FROSTY PARSED SALES:", sales.length);
  console.log("FROSTY FIRST SALE:", sales[0]);
}

    if (!sales.length) {
      marketCache.set(cacheKey, { time: Date.now(), data: fallback });
      return fallback;
    }

    const demand = demandFromSales(sales);
    const trend = trendFromSales(sales, demand);
   const projection = detectProjectionAndBaseline(sales);
const hyperInflated = detectHyperInflatedFromSales(sales);
const lowRap = detectLowRapFromSales(sales, demand, trend);
const valuedDropRisk = detectValuedDropRiskFromSales(sales, knownValue);

const data = {
  demand,
  trend,
 projected: projection.projected || hyperInflated.isHyperInflated,
baselineRap: hyperInflated.isHyperInflated
  ? hyperInflated.hyperBaselineRap
  : projection.baselineRap,
  isHyperInflated: hyperInflated.isHyperInflated,
hyperBaselineRap: hyperInflated.hyperBaselineRap,
hyperPeakRap: hyperInflated.hyperPeakRap,
hyperInflationRatio: hyperInflated.hyperInflationRatio,
hyperInflationReason: hyperInflated.hyperInflationReason,

  isLowRapNow: lowRap.isLowRapNow,
  lowAdjustedRap: lowRap.lowAdjustedRap,
  lowRapReason: lowRap.lowRapReason,
    dropWatch: valuedDropRisk.dropWatch,
  dropEligible: valuedDropRisk.dropEligible,
  isDropping: valuedDropRisk.isDropping,

  dropOriginalValue: valuedDropRisk.dropOriginalValue,
  dropAdjustedValue: valuedDropRisk.dropAdjustedValue,
  dropValueLoss: valuedDropRisk.dropValueLoss,

  dropCriticalRapLine: valuedDropRisk.dropCriticalRapLine,
  dropGuardGap: valuedDropRisk.dropGuardGap,

  dropHoursCritical: valuedDropRisk.dropHoursCritical,
  dropHoursNeeded: valuedDropRisk.dropHoursNeeded,
  dropHoursUntilEligible: valuedDropRisk.dropHoursUntilEligible,

  dropLowSaleDetected: valuedDropRisk.dropLowSaleDetected,
  dropReason: valuedDropRisk.dropReason,

  salesCount: sales.length,
  latestSalePrice: sales[0]?.salePrice || 0,
  latestOldRap: sales[0]?.oldRap || 0,
  latestNewRap: sales[0]?.newRap || 0
};
if (String(itemId) === "114706745345742") {
  console.log("FROSTY FINAL MARKET DATA:", data);
}

    marketCache.set(cacheKey, { time: Date.now(), data });
    return data;
  } catch (err) {
  console.error("MARKET SUMMARY ERROR:", itemId, err);
  marketCache.set(cacheKey, { time: Date.now(), data: fallback });
  return fallback;
}
}
function detectLowRapFromSales(sales, demand = "UNKNOWN", trend = "UNKNOWN") {
  const d = String(demand || "").toUpperCase();
  const t = String(trend || "").toUpperCase();

  // Do not protect low-demand or naturally lowering items.
  // Those can be genuinely falling, not temporarily tanked.
  if (
    d === "LOW" ||
    t.includes("LOWERING") ||
    t.includes("DROPPING") ||
    t.includes("DECLIN")
  ) {
    return {
      isLowRapNow: false,
      lowAdjustedRap: 0,
      lowRapReason: ""
    };
  }
  const latest = sales[0];
  const currentRap = Number(latest?.newRap || 0);

  if (!currentRap) {
    return {
      isLowRapNow: false,
      lowAdjustedRap: 0,
      lowRapReason: ""
    };
  }

  // Ignore the newest few sales because those may be the lowball/tank sales.
  const olderSales = sales.slice(8, 60);

  const normalRapPool = olderSales
    .flatMap(s => [s.oldRap, s.newRap])
    .filter(v => Number.isFinite(v) && v > 0)
    .sort((a, b) => a - b);

  if (normalRapPool.length < 8) {
    return {
      isLowRapNow: false,
      lowAdjustedRap: 0,
      lowRapReason: ""
    };
  }

  const normalRap = median(normalRapPool);

  // Recent suspicious sales: huge under-sales or negative sale prices.
  const recent = sales.slice(0, 8);

  const suspiciousLowSales = recent.filter(s => {
    const salePrice = Number(s.salePrice || 0);

    return (
      salePrice <= 0 ||
      salePrice <= normalRap * 0.65
    );
  });

  const recentNewRaps = recent
    .map(s => s.newRap)
    .filter(v => Number.isFinite(v) && v > 0);

  const recentRapMedian = median(recentNewRaps);

  const rapDroppedEnough =
    currentRap <= normalRap * 0.82 &&
    normalRap - currentRap >= Math.max(30, Math.round(normalRap * 0.12));

  const suspiciousEnough =
    suspiciousLowSales.length >= 2 ||
    recent.some(s => Number(s.salePrice || 0) <= 0);

  const recentStillLow =
    recentRapMedian > 0 && recentRapMedian <= normalRap * 0.9;

  if (rapDroppedEnough && suspiciousEnough && recentStillLow) {
    return {
      isLowRapNow: true,
      lowAdjustedRap: Math.round(normalRap),
      lowRapReason:
        `Recent low sale(s) appear to be dragging RAP down. Current RAP is ${currentRap.toLocaleString()}, but recent normal RAP looks closer to ${Math.round(normalRap).toLocaleString()}.`
    };
  }

  return {
    isLowRapNow: false,
    lowAdjustedRap: 0,
    lowRapReason: ""
  };
}

async function loadRolimonsData() {
  console.log("Loading Rolimons data...");

  const res = await fetch("https://api.rolimons.com/items/v2/itemdetails");
  const data = await res.json();

  itemData = data.items || {};
  nameToItem = {};

  for (const itemId in itemData) {
    const item = itemData[itemId];

    const name = item[0];
    const acronym = item[1];
    const rap = item[2] || 0;

    const rolimonsValue = item[3] || 0;
    const localValue = valueList[normalize(name)] || 0;
    const realValue = rolimonsValue || localValue || 0;

    const rolimonsDemand = item[5] || "UNKNOWN";
    const rolimonsTrend = item[6] || "UNKNOWN";
    const projected = item[7] === 1;
    const isValued = realValue > 0;

    const itemObject = {
      id: String(itemId),
      assetId: String(itemId),
      name,
      acronym,
      rap,
      value: realValue,
      baseValue: isValued ? realValue : rap,
      isValued,
      demand: rolimonsDemand,
      trend: rolimonsTrend,
      projected,
      overpay: overpayList[normalize(name)] || 0,
      rapOverpay: rapOpList[normalize(name)] || 0,
      thumbnailUrl: ""
    };

    nameToItem[normalize(name)] = itemObject;

    if (acronym) {
      nameToItem[normalize(acronym)] = itemObject;
    }
  }

  console.log(`Loaded ${Object.keys(itemData).length} Rolimons items.`);
}

function findItem(name) {
  return nameToItem[normalize(name)] || null;
}
function isTinyRapItem(item) {
  const isValued = !!item?.isValued;
  const rap = Number(item?.rap || item?.recentAveragePrice || 0);

  return !isValued && rap > 0 && rap < 300;
}
async function decorateTradeItems(items) {
  const resolved = [];

  for (const item of items || []) {
    if (!item) continue;

    const copy = { ...item };

    copy.id = String(copy.id || copy.assetId || "");
    copy.assetId = copy.id;
   copy.thumbnailUrl = await fetchThumbnailUrl(copy.id, copy.name);

const tinyRapItem = isTinyRapItem(copy);

const knownValueForDrop = copy.isValued
  ? (copy.baseValue || copy.value)
  : 0;

const market = await fetchMarketSummary(copy.id, knownValueForDrop);

const forceNoHyperInflated =
  normalize(copy.name) === normalize("Masked Hood of the Truest Seer");

if (forceNoHyperInflated) {
  market.projected = false;
  market.baselineRap = 0;
  market.isHyperInflated = false;
  market.hyperBaselineRap = 0;
  market.hyperPeakRap = 0;
  market.hyperInflationRatio = 0;
  market.hyperInflationReason = "Slow low-demand RAP rise, not hyper-inflated.";
}

copy.marketDemand = tinyRapItem
  ? "N/A"
  : rotoriKnownMarketText(market.demand, copy.demand);

copy.marketTrend = tinyRapItem
  ? "N/A"
  : rotoriKnownMarketText(market.trend, copy.trend);
copy.salesCount = market.salesCount;
copy.latestSalePrice = market.latestSalePrice;
copy.latestOldRap = market.latestOldRap;
copy.latestNewRap = market.latestNewRap;
copy.baselineRap = market.baselineRap;
copy.projectedBaseline = market.baselineRap || 0;
copy.isHyperInflated = market.isHyperInflated || false;
copy.hyperBaselineRap = market.hyperBaselineRap || 0;
copy.hyperPeakRap = market.hyperPeakRap || 0;
copy.hyperInflationRatio = market.hyperInflationRatio || 0;
copy.hyperInflationReason = market.hyperInflationReason || "";

copy.isLowRapNow = market.isLowRapNow || false;
copy.lowAdjustedRap = market.lowAdjustedRap || 0;
copy.lowRapReason = market.lowRapReason || "";
copy.dropWatch = market.dropWatch || false;
copy.dropEligible = market.dropEligible || false;
copy.isDropping = copy.isDropping || market.isDropping || false;

copy.dropOriginalValue = market.dropOriginalValue || 0;
copy.dropAdjustedValue = market.dropAdjustedValue || 0;
copy.dropValueLoss = market.dropValueLoss || 0;

copy.dropCriticalRapLine = market.dropCriticalRapLine || 0;
copy.dropGuardGap = market.dropGuardGap || 0;

copy.dropHoursCritical = market.dropHoursCritical || 0;
copy.dropHoursNeeded = market.dropHoursNeeded || 0;
copy.dropHoursUntilEligible = market.dropHoursUntilEligible || 0;

copy.dropLowSaleDetected = market.dropLowSaleDetected || false;
copy.dropReason = market.dropReason || "";

if (tinyRapItem) {
  copy.demand = "N/A";
  copy.trend = "N/A";
  copy.noDemandReason = "RAP under 300";
} else {
  if (market.demand !== "UNKNOWN") {
    copy.demand = market.demand;
  }

  if (market.trend !== "UNKNOWN") {
    copy.trend = market.trend;
  }
}

if (!forceNoHyperInflated && (market.projected || market.isHyperInflated)) {
  copy.projected = true;
  copy.isProjected = true;
}

resolved.push(copy);
}

  return resolved;
}
// =========================
// Rotori projected baseline helpers
// Paste this in server.js, above app.post("/analyze-trade")
// =========================

function rotoriMedian(arr) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}
function rotoriTextFromHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function rotoriParseSalesDateSeconds(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();

  if (!text) return 0;

  const parsed = Date.parse(text.replace(/-/g, "/"));

  return Number.isFinite(parsed)
    ? Math.floor(parsed / 1000)
    : 0;
}

function parseRecentSalesUltraLoose(html, limit = 120) {
  const text = rotoriTextFromHtml(html);
  const sales = [];

  const saleRegex =
    /Sale Price\s*(-?[\d,]+)[\s\S]{0,500}?Old RAP\s*([\d,]+)[\s\S]{0,500}?New RAP\s*([\d,]+)/gi;

  const dateRegex =
    /(\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM))/gi;

  let match;
  const now = Math.floor(Date.now() / 1000);

  while ((match = saleRegex.exec(text)) && sales.length < limit) {
    const before = text.slice(Math.max(0, match.index - 400), match.index);

    let dateMatch;
    let lastDate = "";

    while ((dateMatch = dateRegex.exec(before))) {
      lastDate = dateMatch[1];
    }

    const timestamp = lastDate
      ? rotoriParseSalesDateSeconds(lastDate)
      : now - sales.length * 3600;

    sales.push({
      salePrice: Number(match[1].replace(/,/g, "")),
      oldRap: Number(match[2].replace(/,/g, "")),
      newRap: Number(match[3].replace(/,/g, "")),
      timestamp
    });
  }

  const seen = new Set();

  return sales.filter(s => {
    const key = `${s.timestamp}:${s.salePrice}:${s.oldRap}:${s.newRap}`;

    if (seen.has(key)) return false;
    seen.add(key);

    return (
      Number.isFinite(s.salePrice) &&
      Number.isFinite(s.oldRap) &&
      Number.isFinite(s.newRap) &&
      Number.isFinite(s.timestamp) &&
      s.oldRap > 0 &&
      s.newRap > 0
    );
  });
}



function detectProjectionAndBaseline(sales) {
  if (!sales || sales.length === 0) {
    return { projected: false, baselineRap: 0 };
  }

  const olds = sales
    .map(s => s.oldRap)
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (!olds.length) {
    return { projected: false, baselineRap: 0 };
  }

  let baselineRap;

  // Same idea from your bot: drop the highest 20% so inflated sales do not fake the baseline.
  if (olds.length >= 6) {
    const cutoff = Math.floor(olds.length * 0.8);
    const trimmed = olds.slice(0, cutoff);
    baselineRap = rotoriMedian(trimmed);
  } else {
    baselineRap = rotoriMedian(olds);
  }

  // Find the first huge RAP spike and use sales before that spike.
  const minRap = Math.min(...olds);
  const spikeIdx = sales.findIndex(s => s.newRap >= minRap * 2);

  if (spikeIdx > 0) {
    const preSpike = sales
      .slice(spikeIdx)
      .map(s => s.oldRap)
      .filter(Boolean);

    if (preSpike.length >= 3) {
      baselineRap = rotoriMedian(preSpike);
    } else if (preSpike.length > 0) {
      baselineRap = Math.round(preSpike.reduce((a, b) => a + b, 0) / preSpike.length);
    }
  }

  function countInWindow(centerT, windowSec) {
    let c = 0;
    for (const s of sales) {
      if (Math.abs(s.timestamp - centerT) <= windowSec) c++;
    }
    return c;
  }

   let projectedHistory = false;
  let projectedPeakRap = 0;
  let projectedLastTimestamp = 0;

  for (const s of sales) {
    const oldR = Math.max(1, s.oldRap);
    const ratioPrice = s.salePrice / oldR;
    const ratioRap = Math.max(1, s.newRap) / oldR;

    const bigJump = ratioRap >= 1.6;
    const bigSpike = ratioPrice >= 4;
    const extremeSpike = ratioPrice >= 8;
    const inCluster = countInWindow(s.timestamp, 24 * 60 * 60) >= 2;
    const sustained = s.newRap >= baselineRap * 1.35;
    const minJump = Math.max(500, oldR * 0.25);

    // Keep your old projected detection logic,
    // but store it as HISTORY first instead of instantly marking current projected.
    if (((bigSpike && bigJump && inCluster) || extremeSpike) &&
        sustained &&
        s.newRap - s.oldRap >= minJump) {
      projectedHistory = true;
      projectedPeakRap = Math.max(projectedPeakRap, Number(s.newRap || 0));
      projectedLastTimestamp = Math.max(projectedLastTimestamp, Number(s.timestamp || 0));
    }
  }

  const newestTimestamp = Math.max(
    ...sales.map(s => Number(s.timestamp || 0)).filter(Boolean)
  );

  const latestSale = sales[0] || {};
  const latestRap = Number(latestSale.newRap || latestSale.oldRap || 0);

  const daysSinceProjection =
    projectedLastTimestamp && newestTimestamp
      ? (newestTimestamp - projectedLastTimestamp) / (24 * 60 * 60)
      : 999;

  const activeProjected =
    projectedHistory &&
    daysSinceProjection <= 45 &&
    latestRap >= baselineRap * 1.35;

  return {
    projected: activeProjected,
    projectedHistory,
    projectedPeakRap,
    baselineRap: Math.round(baselineRap || 0)
  };
}

const projectedSalesCache = new Map();

async function getProjectedSalesInfo(itemId) {
  if (!itemId) {
    return { projected: false, baselineRap: 0, recentSales: [] };
  }

  const cacheKey = String(itemId);
  const cached = projectedSalesCache.get(cacheKey);

  if (cached && Date.now() - cached.time < 60_000) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://www.rolimons.com/itemsales/${itemId}`);

    if (!res.ok) {
      return { projected: false, baselineRap: 0, recentSales: [] };
    }

    const html = await res.text();
    const recentSales = parseRecentSales(html, 120);
    const detected = detectProjectionAndBaseline(recentSales);

    const data = {
      projected: detected.projected,
      baselineRap: detected.baselineRap,
      recentSales
    };

    projectedSalesCache.set(cacheKey, {
      time: Date.now(),
      data
    });

    return data;
  } catch (err) {
    console.warn("Rotori projected sales check failed:", itemId, err.message);
    return { projected: false, baselineRap: 0, recentSales: [] };
  }
}

app.post("/analyze-trade", async (req, res) => {
  try {
    const {
      giving,
      receiving,
      givingRobux = 0,
      receivingRobux = 0
    } = req.body;

    const resolvedGivingRaw = (giving || [])
      .map(findItem)
      .filter(Boolean);

    const resolvedReceivingRaw = (receiving || [])
      .map(findItem)
      .filter(Boolean);

    const resolvedGiving = await decorateTradeItems(resolvedGivingRaw);
    const resolvedReceiving = await decorateTradeItems(resolvedReceivingRaw);

    const result = analyzeTradeCore(
      resolvedGiving,
      resolvedReceiving,
      {
        givingRobux: Number(givingRobux || 0),
        receivingRobux: Number(receivingRobux || 0)
      }
    );

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error("Analyze error:", err);

    res.status(500).json({
      success: false,
      verdict: "Rotori backend error",
      reasons: [err.message || "Unknown server error"]
    });
  }
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Rotori backend is running");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, async () => {
  await loadRolimonsData();

  setInterval(async () => {
    await loadRolimonsData();
  }, 10 * 60 * 1000);

  console.log(`Rotori backend running on port ${PORT}`);
});