// rotori-core.js
// Paste this whole file over your current rotori-core.js

function n(x) {
  const v = Number(x || 0);
  return Number.isFinite(v) ? v : 0;
}

function fmtNum(value) {
  return Math.round(n(value)).toLocaleString();
}

function signedNum(value) {
  const num = Math.round(n(value));
  return `${num > 0 ? "+" : ""}${num.toLocaleString()}`;
}

function cleanWord(x) {
  return String(x || "").trim().toUpperCase().replace(/[\s_-]+/g, " ");
}

function normalizeDemand(value) {
  if (typeof value === "number") {
    if (value >= 4) return "ULTRA HIGH";
    if (value === 3) return "HIGH";
    if (value === 2) return "MEDIUM";
    if (value === 1) return "LOW";
    return "UNKNOWN";
  }

  const d = cleanWord(value);
  if (!d || d === "0") return "UNKNOWN";
  if (d.includes("ULTRA")) return "ULTRA HIGH";
  if (d.includes("HIGH")) return "HIGH";
  if (d.includes("MED")) return "MEDIUM";
  if (d.includes("LOW") || d.includes("NONE")) return "LOW";

  const num = Number(d);
  if (Number.isFinite(num)) return normalizeDemand(num);

  return d;
}
function isFaceBlockedItem(item = {}) {
  const saleStatus = String(
    item.saleStatus ||
    item.salesStatus ||
    item.status ||
    item.salesText ||
    item.activity ||
    item.saleActivity ||
    item.saleStatusText ||
    ""
  ).toLowerCase();

  const typeText = String(
    item.assetType ||
    item.assetTypeName ||
    item.type ||
    item.category ||
    item.itemType ||
    ""
  ).toLowerCase();

  const name = String(item.name || "").toLowerCase();

  if (item.isUnknownSaleStatus || item.unknownSaleStatus) return true;
  if (saleStatus.includes("unknown")) return true;
  if (typeText.includes("face")) return true;

  if (
    name.includes("mermaid princess") ||
    name.includes("pink mermaid princess") ||
    name.includes("purple mermaid") ||
    name.includes("face") ||
    name.includes("smile") ||
    name.includes("wink") ||
    name.includes("eyes") ||
    name.includes("mouth") ||
    name.includes("prankster") ||
    name.includes("tattletale") ||
    name.includes("yum")
  ) {
    return true;
  }

  return false;
}

function normalizeTrend(value) {
  if (typeof value === "number") {
    if (value <= -2) return "LOWERING";
    if (value === -1) return "SLIGHTLY LOWERING";
    if (value === 0) return "STABLE";
    if (value === 1) return "STABLE";
    if (value >= 2) return "INCREASING";
    return "UNKNOWN";
  }

  const t = cleanWord(value);
  if (!t || t === "0") return "UNKNOWN";
  if (t.includes("NOT HIGHERING")) return "NOT HIGHERING LOW DEMAND";
  if (t.includes("LOWERING") || t.includes("DROPPING") || t.includes("DECLIN")) return "LOWERING";
  if (t.includes("SLIGHT")) return "SLIGHTLY LOWERING";
  if (t.includes("INCREAS") || t.includes("RAISING") || t.includes("RISING")) return "INCREASING";
  if (t.includes("FAIR") || t.includes("STABLE") || t.includes("NORMAL")) return "STABLE";

  const num = Number(t);
  if (Number.isFinite(num)) return normalizeTrend(num);

  return t;
}

function tradeMetric(item) {
  if (!item) return 0;

  if (item.isValued) {
    const normalValue = n(item.baseValue || item.value);
    const dropAdjustedValue = n(item.dropAdjustedValue);

    if (
      (item.dropEligible || item.isDropping) &&
      dropAdjustedValue > 0 &&
      dropAdjustedValue < normalValue
    ) {
      return dropAdjustedValue;
    }

    return normalValue;
  }

  return safeRapMetric(item);
}
function inferProjectedBaselineRap(item) {
  if (!item) return 0;

  const direct = n(
    item.baselineRap ||
    item.projectedBaseline ||
    item.preProjectionRap ||
    item.hyperBaselineRap
  );

  const rawSales = Array.isArray(item.sales)
    ? item.sales
    : Array.isArray(item.recentSales)
      ? item.recentSales
      : [];

  const sales = rawSales
    .map(s => ({
      salePrice: n(s.salePrice || s.price),
      oldRap: n(s.oldRap || s.oldRAP),
      newRap: n(s.newRap || s.newRAP),
      timestamp: n(s.timestamp || s.time || s.date)
    }))
    .filter(s => s.salePrice > 0 && s.oldRap > 0 && s.newRap > 0);

  function localMedian(nums) {
    const arr = nums
      .filter(v => Number.isFinite(Number(v)) && Number(v) > 0)
      .map(Number)
      .sort((a, b) => a - b);

    if (!arr.length) return 0;

    const mid = Math.floor(arr.length / 2);

    return arr.length % 2
      ? arr[mid]
      : Math.round((arr[mid - 1] + arr[mid]) / 2);
  }

  if (sales.length >= 3) {
    // Rolimons sales are usually newest first, so flip to oldest -> newest.
    const chronological = [...sales].reverse();

    let pumpIndex = -1;

    for (let i = 0; i < chronological.length; i++) {
      const sale = chronological[i];

      const priceRatio = sale.salePrice / sale.oldRap;
      const rapRatio = sale.newRap / sale.oldRap;
      const jump = sale.newRap - sale.oldRap;

      const strongPump =
        priceRatio >= 2.25 &&
        rapRatio >= 1.12 &&
        jump >= Math.max(500, sale.oldRap * 0.08);

      const extremePump =
        priceRatio >= 3.25 &&
        jump >= Math.max(500, sale.oldRap * 0.06);

      if (strongPump || extremePump) {
        pumpIndex = i;
        break;
      }
    }

    if (pumpIndex >= 0) {
      const pumpOldRap = chronological[pumpIndex].oldRap;

      // Use the stable window right before the pump, not ancient low history.
      const prePumpWindow = chronological.slice(
        Math.max(0, pumpIndex - 8),
        pumpIndex + 1
      );

      const nearbyRaps = [];

      for (const sale of prePumpWindow) {
        nearbyRaps.push(sale.oldRap, sale.newRap);
      }

      const closeToPump = nearbyRaps.filter(v =>
        v >= pumpOldRap * 0.75 &&
        v <= pumpOldRap * 1.15
      );

      const salesBaseline = localMedian(closeToPump.length ? closeToPump : nearbyRaps);

      // If sales prove a newer/higher baseline, override stale backend baseline.
      if (salesBaseline > 0) {
        if (!direct) return salesBaseline;

        if (salesBaseline >= direct * 1.25) {
          return salesBaseline;
        }

        return Math.max(salesBaseline, direct);
      }
    }
  }

  return direct > 0 ? direct : 0;
}
function safeRapMetric(item) {
  if (!item) return 0;

  // Keep projected logic FIRST.
  // Projecteds still use pre-projection baseline RAP.
  if ((item.projected || item.isProjected) && !item.isValued) {
    const baseline = safeProjectedRap(item);
    if (baseline > 0) return baseline;
    return n(item.rap || item.recentAveragePrice);
  }

  // Low-RAP correction only applies to normal non-projected RAP items.
  if (
    item.isLowRapNow &&
    !item.isValued &&
    n(item.lowAdjustedRap) > n(item.rap)
  ) {
    return n(item.lowAdjustedRap);
  }

  return n(item.rap || item.recentAveragePrice);
}
function isActuallyProjected(item) {
  return !!(
    item?.isActualProjected ||
    (
      (item?.projected || item?.isProjected) &&
      !item?.isHyperInflated
    )
  );
}
function shapeMetric(item) {
  if (!item) return 0;

  // Shape detection should use visible/raw size.
  // Example: projected Beanie still acts like the main downgrade item,
  // but actual profit math still uses tradeMetric/effectiveMetric.
  return item.isValued ? n(item.baseValue || item.value) : n(item.rap);
}

function biggestBy(arr, fn) {
  return (arr || []).reduce((best, item) => {
    if (!best) return item;
    return fn(item) > fn(best) ? item : best;
  }, null);
}

const RAP_OP_ANCHORS = [
  [1600, 150],
  [2000, 200],
  [3500, 300],
  [5000, 500],
  [7000, 700],
  [10000, 1000],
];

function rapOpCurve(rap) {
  rap = n(rap);
  if (rap <= 0) return 0;

  if (rap <= RAP_OP_ANCHORS[0][0]) {
    return Math.round((rap / RAP_OP_ANCHORS[0][0]) * RAP_OP_ANCHORS[0][1]);
  }

  for (let i = 0; i < RAP_OP_ANCHORS.length - 1; i++) {
    const [x1, y1] = RAP_OP_ANCHORS[i];
    const [x2, y2] = RAP_OP_ANCHORS[i + 1];

    if (rap <= x2) {
      const t = (rap - x1) / (x2 - x1);
      return Math.round(y1 + t * (y2 - y1));
    }
  }

  return Math.round(rap * 0.1);
}

function itemOP(item) {
  if (!item) return 0;

  if (item.isValued) {
    return n(item.overpay || item.valueOverpay || item.valueOP);
  }

  const realRap = (item.projected || item.isProjected)
    ? safeProjectedRap(item)
    : (
        item.isLowRapNow && n(item.lowAdjustedRap) > n(item.rap)
          ? n(item.lowAdjustedRap)
          : n(item.rap)
      );

  // If projected baseline is missing, do not estimate OP from inflated RAP.
  if ((item.projected || item.isProjected) && realRap <= 0) {
    return 0;
  }

  // Normal RAP items under 1,000 automatically need at least 85 OP.
  const smallRapMinimumOP =
    realRap > 0 && realRap < 1000
      ? 135
      : 0;

  const manualRapOP = n(item.rapOverpay || item.rapOP || item.overpay);

  if (manualRapOP > 0) {
    return Math.max(manualRapOP, smallRapMinimumOP);
  }

  return Math.max(rapOpCurve(realRap), smallRapMinimumOP);
}

function itemManualOP(item) {
  if (!item) return 0;

  if (item.isValued) {
    return n(item.overpay || item.valueOverpay || item.valueOP);
  }

  // For RAP items, only count OP if you manually set RAP OP.
  // Do NOT use rapOpCurve here.
  return n(item.rapOverpay || item.rapOP || item.overpay);
}

function rapWithOp(item) {
  if (!item) return 0;
  return tradeMetric(item) + itemOP(item);
}

function safeProjectedRap(item) {
  return inferProjectedBaselineRap(item);
}
function effectiveMetric(item) {
  if (!item) return 0;
  if ((item.projected || item.isProjected) && !item.isValued) {
    const baseline = safeProjectedRap(item);
    return baseline > 0 ? baseline : n(item.rap || item.recentAveragePrice);
  }
  return tradeMetric(item);
}

function sum(arr, fn) {
  return (arr || []).reduce((s, x) => s + fn(x), 0);
}

function biggest(arr) {
  return (arr || []).reduce((best, item) => {
    if (!best) return item;
    return tradeMetric(item) > tradeMetric(best) ? item : best;
  }, null);
}

function itemLabel(item) {
  return item?.name || "the main item";
}

function isHighDemand(item) {
  const d = normalizeDemand(item?.demand);
  return d === "HIGH" || d === "ULTRA HIGH";
}
function isFaceLikeItem(item) {
  const name = String(item?.name || "").toUpperCase();

  return (
    name.includes("FACE") ||
    name.includes("SMILE") ||
    name.includes("WINK") ||
    name.includes("GAZE") ||
    name.includes("EYES") ||
    name.includes("FRECKLE") ||
    name.includes("PRANKSTER") ||
    name.includes("TATTLETALE") ||
    name.includes("YUM") ||
    name.includes("FIRST TIME I EVER PLAYED") ||
    name.includes("I EVER PLAYED ROBLOX")
  );
}

function isValuedOverRap(item) {
  if (!item?.isValued) return false;

  const rap = n(item.rap || item.recentAveragePrice);
  const value = tradeMetric(item);

  return value > 0 && rap >= value;
}

function isValuedNearRaising(item) {
  if (!item?.isValued) return false;

  const rap = n(item.rap || item.recentAveragePrice);
  const value = tradeMetric(item);

  if (!value || rap >= value) return false;

  return value - rap <= Math.max(250, Math.round(value * 0.025));
}

function isLowDemand(item) {
  return normalizeDemand(item?.demand) === "LOW";
}
function majorityAtLeastMediumDemand(items) {
  if (!items?.length) return false;
  return items.filter(item => demandRank(item) >= 2).length > items.length / 2;
}
function isWeakTrend(item) {
  if (isValuedOverRap(item)) return false;

  const t = normalizeTrend(item?.trend);

  return (
    t === "LOWERING" ||
    t === "SLIGHTLY LOWERING" ||
    t === "NOT HIGHERING LOW DEMAND"
  );
}

function isGoodTrend(item) {
  if (isValuedOverRap(item)) return true;
  if (isValuedNearRaising(item)) return true;

  return normalizeTrend(item?.trend) === "INCREASING";
}

function performanceScore(item) {
  let score = 0;
  const d = normalizeDemand(item?.demand);
  const t = normalizeTrend(item?.trend);

  if (d === "ULTRA HIGH") score += 3;
  else if (d === "HIGH") score += 2;
  else if (d === "MEDIUM") score += 1;
  else if (d === "LOW") score -= 1.5;

  if (t === "INCREASING") score += 1.5;
  else if (t === "STABLE") score += 0.25;
  else if (t === "SLIGHTLY LOWERING") score -= 1;
  else if (t === "LOWERING") score -= 2;
  else if (t === "NOT HIGHERING LOW DEMAND") score -= 1.5;

  if (item?.projected || item?.isProjected) score -= 4;
  if (item?.isDropping) score -= 2;

  return score;
}
function demandRank(item) {
  const d = normalizeDemand(item?.demand);

  if (d === "ULTRA HIGH") return 4;
  if (d === "HIGH") return 3;
  if (d === "MEDIUM") return 2;
  if (d === "LOW") return 1;

  return 0;
}

function isBadDowngradePiece(item) {
  return !!(
    item?.projected ||
    item?.isProjected ||
    item?.isDropping ||
    isLowDemand(item) ||
    isWeakTrend(item)
  );
}

function anchorBetterThanMajority(anchor, receiving) {
  if (!anchor || !receiving?.length) return false;

  const anchorScore = performanceScore(anchor);

  const worseCount = receiving.filter(item => {
    return anchorScore >= performanceScore(item) + 0.75;
  }).length;

  return worseCount > receiving.length / 2;
}

function majorityIncomingBad(receiving) {
  if (!receiving?.length) return false;

  const badCount = receiving.filter(isBadDowngradePiece).length;

  return badCount > receiving.length / 2;
}

function isWeakDowngradeAnchor(anchor) {
  // Only LOW DEMAND should lower the required downgrade OP.
  // Do not lower just because the item is lowering, under RAP, near dropping, etc.
  return isLowDemand(anchor);
}

function downgradeIntoBetterDemandRap(anchor, receiving) {
  if (!anchor || !receiving?.length) return false;

  const anchorDemand = demandRank(anchor);

  const incomingRapItems = receiving.filter(item => !item.isValued);

  if (!incomingRapItems.length) return false;

  const betterRapItems = incomingRapItems.filter(item => {
    return demandRank(item) > anchorDemand && demandRank(item) >= 3;
  });

  return betterRapItems.length > incomingRapItems.length / 2;
}

function getDowngradeRequiredAdjustment(anchor, receiving, baseRequired) {
  let multiplier = 1;
  const notes = [];

  const betterDemandRap = downgradeIntoBetterDemandRap(anchor, receiving);

  const anchorIsLowDemand =
    !anchor?.isValued &&
    isLowDemand(anchor) &&
    betterDemandRap;

  const anchorBeatsMajority = anchorBetterThanMajority(anchor, receiving);
  const incomingMostlyBad = majorityIncomingBad(receiving);

  /*
    Rule 1:
    If your main item is NOT low demand, and it is better than most of
    the receiving side, then bad incoming items should make you ask for MORE.
  */
  if (!anchorIsLowDemand && anchorBeatsMajority && incomingMostlyBad) {
    multiplier *= 1.25;

    notes.push(
      `${itemLabel(anchor)} performs better than most incoming items, and their side is mostly weak. Rotori raises the required OP by 25% because you are downgrading a stronger main item into worse pieces.`
    );
  }

  /*
    Rule 2:
    Only lower the downgrade requirement if YOUR MAIN ITEM is a low-demand RAP item
    and you are downgrading into mostly better-demand RAP items.
  */
  if (anchorIsLowDemand) {
    multiplier *= 0.75;

    notes.push(
      `${itemLabel(anchor)} is a LOW DEMAND RAP item, and you are getting better-demand RAP items back. Rotori lowers the required OP by 25% because the downgrade gives you easier pieces to move.`
    );
  }

  const adjustedRequired = Math.max(0, Math.round(baseRequired * multiplier));

// NEW: if the main downgrade item is a RAP item under 1,000,
// never let demand/quality discounts pull the ask below 85 OP.
const anchorRapForSmallFloor =
  anchor && !anchor.isValued
    ? safeRapMetric(anchor)
    : 0;

const smallRapMinimumOP =
  anchorRapForSmallFloor > 0 && anchorRapForSmallFloor < 1000
    ? 135
    : 0;

const required = Math.max(adjustedRequired, smallRapMinimumOP);

if (smallRapMinimumOP > 0 && adjustedRequired < smallRapMinimumOP) {
  notes.push(
    `${itemLabel(anchor)} is under 1,000 RAP, so Rotori keeps the minimum downgrade ask at 85 OP instead of ${fmtNum(adjustedRequired)}.`
  );
}

  if (required !== baseRequired) {
    const change = required - baseRequired;
    const direction = change > 0 ? "increased" : "reduced";

    notes.push(
      `Downgrade ask adjusted: base ask was ${fmtNum(baseRequired)} OP, then Rotori ${direction} it to ${fmtNum(required)} OP after checking demand quality.`
    );
  }

  return {
    required,
    multiplier,
    notes
  };
}
function rapHealth(item) {
  if (!item?.isValued) return "RAP item";

  const value = tradeMetric(item);
  const rap = n(item.rap);
  const gap = value - rap;

  if (item.projected || item.isProjected) return "projected/inflated risk";
  if (rap >= value) return "raising / above value";
  if (gap <= Math.max(200, Math.round(value * 0.02))) return "near raising";
  if (gap <= Math.max(500, Math.round(value * 0.06))) return "healthy";
  if (gap <= Math.max(1000, Math.round(value * 0.12))) return "under RAP";
  return "critical under RAP";
}

function itemPerformanceLine(item, side) {
  const name = itemLabel(item);
  const metric = item.isValued
    ? `value ${fmtNum(tradeMetric(item))}, RAP ${fmtNum(item.rap)}`
    : `RAP ${fmtNum(item.rap)}`;

  const op = item.isValued ? itemManualOP(item) : itemOP(item);
  const demand = normalizeDemand(item.demand);
  const trend = isValuedOverRap(item)
  ? "INCREASING / OVER RAP"
  : isValuedNearRaising(item)
    ? "NEAR RAISING"
    : normalizeTrend(item.trend);
  const health = rapHealth(item);
  const actualProjected = isActuallyProjected(item);

  const warnings = [];
  if (actualProjected) warnings.push("PROJECTED");
  else if (item.isHyperInflated) warnings.push("HYPER-INFLATED");
  if (item.isDropping) warnings.push("DROPPING");
  if (item.previousTierDropWatch) warnings.push("previous tier watch");
  if (isLowDemand(item)) warnings.push("low demand");
  if (isWeakTrend(item)) warnings.push("weak trend");
  if (item.isValued && health.includes("critical")) warnings.push("critical under RAP");
  if (item.isValued && health.includes("under RAP")) warnings.push("under RAP");

  const prefix = side === "receiving" ? "Incoming" : "Outgoing";
  const warningText = warnings.length ? ` Warning: ${warnings.join(", ")}.` : "";

  return `${prefix} ${name}: ${metric}${op ? `, OP ${fmtNum(op)}` : ""}. Demand: ${demand}. Trend: ${trend}. RAP health: ${health}.${warningText}`;
}

function addItemPerformanceNotes(giving, receiving, reasons) {
  const all = [
    ...giving.map(item => [item, "giving"]),
    ...receiving.map(item => [item, "receiving"])
  ];

  for (const [item, side] of all) {
    if (item.previousTierDropWatch) {
      reasons.push(
        item.previousTierReason ||
        `${itemLabel(item)} is on previous-tier watch: value ${fmtNum(item.baseValue || item.value)}, RAP ${fmtNum(item.rap)}, and it is struggling under the ${fmtNum(item.previousRapTierLine)} RAP tier.`
      );
    }

    if (item.isHyperInflated && !isActuallyProjected(item) && item.hyperBaselineRap > 0) {
  if (side === "giving" || item.ownedHyperInflated) {
    reasons.push(
      `${itemLabel(item)} looks HYPER-INFLATED: current RAP is ${fmtNum(item.rap)}, and safer historical RAP looks closer to ${fmtNum(item.hyperBaselineRap)}. Since this is on your side, Rotori is NOT lowering your outgoing RAP in the verdict, but you should try to trade it off before it deflates more.`
    );
  } else {
    reasons.push(
      `${itemLabel(item)} looks HYPER-INFLATED: current RAP is ${fmtNum(item.rap)}, but Rotori is treating it closer to ${fmtNum(item.hyperBaselineRap)} because you are receiving it.`
    );
  }
}
    if (item.dropWatch) {
      const originalValue = n(item.dropOriginalValue || item.baseValue || item.value);
      const adjustedValue = n(item.dropAdjustedValue);
      const valueLoss = n(item.dropValueLoss || (originalValue - adjustedValue));
      const criticalLine = n(item.dropCriticalRapLine);
      const hoursCritical = n(item.dropHoursCritical);
      const hoursNeeded = n(item.dropHoursNeeded);
      const hoursLeft = n(item.dropHoursUntilEligible);

      if (item.dropEligible || item.isDropping) {
        reasons.push(
          `${itemLabel(item)} is DROP-ELIGIBLE: original value is ${fmtNum(originalValue)}, current RAP is ${fmtNum(item.rap)}, and Rotori's drop line is around ${fmtNum(criticalLine)} RAP. It has been critically under RAP for about ${hoursCritical} hours, so Rotori treats it as ${fmtNum(adjustedValue)} instead of ${fmtNum(originalValue)}, removing ${fmtNum(valueLoss)} value from the trade.`
        );
      } else {
        const guardReason = item.dropLowSaleDetected
          ? "because the critical gap came from a negative or under-1,000 sale, Rotori uses the 36-hour guard"
          : "because this was not caused by a negative or under-1,000 sale, Rotori uses the 24-hour rule";

        reasons.push(
          `${itemLabel(item)} is in the critical drop zone: original value is ${fmtNum(originalValue)}, current RAP is ${fmtNum(item.rap)}, and Rotori's drop line is around ${fmtNum(criticalLine)} RAP. It has been critically under RAP for about ${hoursCritical} hours; ${guardReason}. About ${fmtNum(hoursLeft)} more hour(s) until Rotori treats it as ${fmtNum(adjustedValue)} instead of ${fmtNum(originalValue)}.`
        );
      }
    }
    if (item.isLowRapNow && item.lowAdjustedRap > item.rap) {
      reasons.push(
        `${itemLabel(item)} looks LOW right now: current RAP is ${fmtNum(item.rap)}, but Rotori is treating it closer to ${fmtNum(item.lowAdjustedRap)} because recent low sale(s) appear to be dragging RAP down.`
      );
    }

    if (
      item.projected ||
      item.isProjected ||
      item.isHyperInflated ||
      item.isDropping ||
      isLowDemand(item) ||
      isWeakTrend(item) ||
      isGoodTrend(item) ||
      isHighDemand(item) ||
      item.isValued ||
      item.isLowRapNow
    ) {
      reasons.push(itemPerformanceLine(item, side));
    }
  }
}

function classifyTradeType(giving, receiving, reasons) {
  const giveCount = giving.length;
  const receiveCount = receiving.length;

  let tradeType = "EVEN";
  if (giveCount > receiveCount) tradeType = "UPGRADE";
  if (giveCount < receiveCount) tradeType = "DOWNGRADE";

  const topGive = biggestBy(giving, shapeMetric);
const topReceive = biggestBy(receiving, shapeMetric);

const giveTotal = sum(giving, shapeMetric);
const receiveTotal = sum(receiving, shapeMetric);

const giveTopShare = giveTotal ? shapeMetric(topGive) / giveTotal : 0;
const receiveTopShare = receiveTotal ? shapeMetric(topReceive) / receiveTotal : 0;

const allReceivingSmaller = topGive
  ? receiving.every(i => shapeMetric(i) <= shapeMetric(topGive))
  : false;

const allGivingSmaller = topReceive
  ? giving.every(i => shapeMetric(i) <= shapeMetric(topReceive))
  : false;

  if (tradeType === "UPGRADE" && giveTopShare >= 0.68 && allReceivingSmaller && receiveCount > 1) {
    tradeType = "DOWNGRADE";
    reasons.push("Your side is mostly one main item and their side is smaller pieces, so Rotori treats this as a downgrade.");
  }

  if (tradeType === "DOWNGRADE" && receiveTopShare >= 0.72 && allGivingSmaller && giveCount > 1) {
    tradeType = "UPGRADE";
    reasons.push("Their side is mostly one main target, so Rotori treats this as an upgrade.");
  }
  if (
  tradeType === "EVEN" &&
  topGive &&
  topReceive &&
  giveTopShare >= 0.60 &&
  shapeMetric(topGive) >= shapeMetric(topReceive) * 1.35 &&
  receiveTopShare <= 0.70
) {
  tradeType = "DOWNGRADE";
  reasons.push(
    `Even item count, but your side is centered around ${itemLabel(topGive)}, which is much bigger than their biggest item, so Rotori treats this as a downgrade.`
  );
}

  if (tradeType === "EVEN" && giveTopShare >= 0.65 && receiveTopShare <= 0.60) {
    tradeType = "DOWNGRADE";
    reasons.push("Your side is concentrated into one main item, while their side is spread into pieces.");
  }

  if (tradeType === "EVEN" && receiveTopShare >= 0.70 && giveTopShare <= 0.60) {
    tradeType = "UPGRADE";
    reasons.push("Their side is concentrated into one main target, so Rotori treats this as an upgrade.");
  }

  return tradeType;
}

function expectedOpUpgrade(target, giveCount, receiveCount) {
  // Valued target: use manual/value OP.
  // RAP target: estimate OP from RAP curve unless rapop.json has a manual RAP OP.
  return Math.max(0, Math.round(itemOP(target)));
}

function expectedOpDowngrade(anchor) {
  if (!anchor) return 0;
  return itemOP(anchor) || (anchor.isValued ? 0 : rapOpCurve(anchor.rap));
}

function upgradeShapeRoomPercent(giveCount, receiveCount) {
  if (giveCount <= receiveCount) return 0;

  const itemDrop = giveCount - receiveCount;

  if (receiveCount === 1) {
    if (giveCount === 2) return 0.25;
    if (giveCount === 3) return 0.12;
    if (giveCount >= 4) return 0.00;
  }

  if (itemDrop === 1) {
    if (giveCount === 4 && receiveCount === 3) return 0.20;
    if (giveCount === 3 && receiveCount === 2) return 0.18;
    return 0.16;
  }

  if (itemDrop === 2) {
    if (giveCount === 4 && receiveCount === 2) return 0.08;
    return 0.10;
  }

  return 0;
}
function rotoriUpgradeShapePatch(giveCount, receiveCount) {
  const shape = `${giveCount}v${receiveCount}`;

  const patches = {
    "2v1": {
      discountPercent: 0.45,
      reason: "2v1 is not a clean upgrade. You are only giving 2 items for 1, so Rotori applies the biggest max-OP discount."
    },
    "3v1": {
      discountPercent: 0.22,
      reason: "3v1 gets a discount, but less than 2v1 because it is a better upgrade shape."
    },
    "4v1": {
      discountPercent: 0,
      reason: "4v1 is the cleanest upgrade shape, so Rotori does not lower max OP for shape."
    },
    "3v2": {
      discountPercent: 0.25,
      reason: "3v2 is not a very clean upgrade shape, so Rotori lowers the max OP."
    },
    "4v3": {
      discountPercent: 0.35,
      reason: "4v3 is weak upgrade room because you are barely reducing item count, so Rotori applies a big max-OP discount."
    },
    "4v2": {
      discountPercent: 0.12,
      reason: "4v2 gets a small shape discount, but it is not as strict as 2v1, 3v2, or 4v3."
    }
  };

  return patches[shape] || {
    discountPercent: 0,
    reason: ""
  };
}

function analyzeOneForOne(giving, receiving) {
  const mine = giving[0];
  const theirs = receiving[0];
  const reasons = [];

  if (!mine || !theirs) {
    return {
      verdict: "❌ Missing item data",
      tradeType: "1V1",
      reasons: ["Rotori could not resolve both items."]
    };
  }

  if (mine.id === theirs.id) {
    return {
      verdict: "⚖️ Fair 1v1",
      tradeType: "1V1",
      reasons: ["Same item on both sides."]
    };
  }

  if ((theirs.projected || theirs.isProjected) && !theirs.isValued) {
  const theirBaseline = safeProjectedRap(theirs);
  const myRealValue = tradeMetric(mine);
  const realDiff = theirBaseline - myRealValue;

  if (theirBaseline <= 0) {
    return {
      verdict: "❌ Decline 1v1",
      tradeType: "PROJECTED WARNING",
      counterMode: "THEM_REPLACE_OR_ADD",
      counterTarget: Math.max(100, Math.round(n(theirs.rap) * 0.25)),
      reasons: [
        `Incoming item ${theirs.name} is projected, but Rotori could not find a safe baseline RAP.`
      ]
    };
  }

  if (realDiff > 0) {
    return {
      verdict: "✅ Good projected 1v1 flip",
      tradeType: "1V1",
      reasons: [
        `${theirs.name} is projected, so Rotori counts it closer to ${fmtNum(theirBaseline)}, not full RAP.`,
        `You are giving about ${fmtNum(myRealValue)} for a de-projected value around ${fmtNum(theirBaseline)}, so you profit about ${fmtNum(realDiff)}.`
      ]
    };
  }

  return {
    verdict: "❌ Bad projected 1v1",
    tradeType: "PROJECTED WARNING",
    counterMode: "THEM_REPLACE_OR_ADD",
    counterTarget: Math.abs(realDiff),
    reasons: [
      `${theirs.name} is projected, so Rotori counts it closer to ${fmtNum(theirBaseline)}, not full RAP.`,
      `After de-projecting it, you are losing about ${fmtNum(Math.abs(realDiff))}.`
    ]
  };
}

  const diff = tradeMetric(theirs) - tradeMetric(mine);
  const qualityDiff = performanceScore(theirs) - performanceScore(mine);

  if (mine.isValued && theirs.isValued) {
    reasons.push(`You give ${mine.name} (${fmtNum(tradeMetric(mine))}) and receive ${theirs.name} (${fmtNum(tradeMetric(theirs))}).`);
    reasons.push(`Item performance swing is ${qualityDiff >= 0 ? "+" : ""}${qualityDiff.toFixed(1)}.`);

    if (diff > 0) return { verdict: `✅ Win 1v1: +${fmtNum(diff)}`, tradeType: "1V1", reasons };

    if (diff < 0 && qualityDiff <= 0) {
      return {
        verdict: `❌ Loss 1v1: ${fmtNum(diff)}`,
        tradeType: "1V1",
        counterMode: "THEM_REPLACE_OR_ADD",
        counterTarget: Math.abs(diff),
        reasons: [...reasons, "You lose value and their item does not perform better enough to justify it."]
      };
    }

    if (diff < 0) {
      return {
        verdict: "⚖️ Fair 1v1",
        tradeType: "1V1",
        reasons: [...reasons, "You lose some value, but their item performs better."]
      };
    }

    return { verdict: "⚖️ True 1v1 valued swap", tradeType: "1V1", reasons };
  }

  if (!mine.isValued && theirs.isValued) {
    const pay = rapWithOp(mine);
    const ask = tradeMetric(theirs) + itemOP(theirs);
    const gap = ask - pay;

    if (gap > 0) {
      return {
        verdict: "✅ Good RAP → valued pickup",
        tradeType: "1V1",
        reasons: [`You pay about ${fmtNum(pay)} for an ask around ${fmtNum(ask)}, under by ${fmtNum(gap)}.`]
      };
    }

    return {
      verdict: "❌ Overpaying for valued",
      tradeType: "1V1",
      counterMode: "THEM_REPLACE_OR_ADD",
      counterTarget: Math.abs(gap),
      reasons: [`You pay about ${fmtNum(pay)} for an ask around ${fmtNum(ask)}, over by ${fmtNum(Math.abs(gap))}.`]
    };
  }

  if (mine.isValued && !theirs.isValued) {
    const incoming = rapWithOp(theirs);
    const ask = tradeMetric(mine) + itemOP(mine);
    const gap = incoming - ask;

    if (gap >= 0 && !isLowDemand(theirs) && !isWeakTrend(theirs)) {
      return {
        verdict: "✅ Good valued → RAP swap",
        tradeType: "1V1",
        reasons: [`Incoming is about ${fmtNum(incoming)} vs your ask around ${fmtNum(ask)}.`]
      };
    }

    return {
      verdict: "❌ Decline valued → RAP lowball",
      tradeType: "1V1",
      counterMode: "THEM_REPLACE_OR_ADD",
      counterTarget: Math.max(100, Math.abs(gap)),
      reasons: [`Incoming is about ${fmtNum(incoming)} vs your ask around ${fmtNum(ask)}, short by ${fmtNum(Math.abs(gap))}.`]
    };
  }

  const mineMetric = tradeMetric(mine);
const theirsMetric = tradeMetric(theirs);
const loss = mineMetric - theirsMetric;
const lossPct = mineMetric > 0 ? loss / mineMetric : 0;
const betterDemand = demandRank(theirs) > demandRank(mine);
const betterQuality = qualityDiff > 0;
const ONE_V_ONE_MAX_LOSS_PCT = 0.04;
const demandGap = demandRank(theirs) - demandRank(mine);

const oneVOneLossReason =
  demandGap > 0
    ? `Higher demand does not justify losing more than ${Math.round(ONE_V_ONE_MAX_LOSS_PCT * 100)}% in a 1v1.`
    : demandGap === 0
      ? `Both items have the same demand, so there is no demand upgrade to justify this RAP loss.`
      : `${theirs.name} has lower demand, so this RAP loss is not justified.`;

if (diff > 0 && qualityDiff >= -1) {
  return {
    verdict: `✅ Good 1v1 RAP gain: +${fmtNum(diff)}`,
    tradeType: "1V1",
    reasons: [`You gain about ${fmtNum(diff)} RAP.`]
  };
}

// Losing RAP in a 1v1 is only acceptable when the loss is under 10%
// AND the item you receive has better demand/quality.
if (diff < 0) {
  if (lossPct <= ONE_V_ONE_MAX_LOSS_PCT && betterDemand && betterQuality) {
    return {
      verdict: "✅ Good 1v1 demand upgrade",
      tradeType: "1V1",
      reasons: [
        `You lose ${fmtNum(loss)} RAP, which is about ${Math.round(lossPct * 100)}% of your item.`,
        `${theirs.name} has better demand/quality, so this is acceptable under the ${Math.round(ONE_V_ONE_MAX_LOSS_PCT * 100)}% 1v1 loss rule.`
      ]
    };
  }

  return {
    verdict: `❌ Bad 1v1 RAP loss: ${fmtNum(diff)}`,
    tradeType: "1V1",
    counterMode: "THEM_REPLACE_OR_ADD",
    counterTarget: Math.abs(diff),
    reasons: [
      `You lose ${fmtNum(loss)} RAP, which is about ${Math.round(lossPct * 100)}% of your item.`,
      oneVOneLossReason
    ]
  };
}

return {
  verdict: "⚖️ Fair 1v1",
  tradeType: "1V1",
  reasons: [`Raw RAP swing is ${signedNum(diff)}. Item performance swing is ${qualityDiff >= 0 ? "+" : ""}${qualityDiff.toFixed(1)}.`]
};
  }
function baseResult(partial, giving, receiving, extraReasons) {
  const givingRobux = n(giving.rotoriRobux);
  const receivingRobux = n(receiving.rotoriRobux);

  const givingTotal = sum(giving, tradeMetric) + givingRobux;
  const receivingTotal = sum(receiving, tradeMetric) + receivingRobux;
  const diff = receivingTotal - givingTotal;
  const givingRap = sum(giving, i => n(i.rap)) + givingRobux;
  const receivingRap = sum(receiving, i => n(i.rap)) + receivingRobux;
  const rapDiff = receivingRap - givingRap;

  return {
    givingRobux,
    receivingRobux,
    verdict: partial.verdict,
    tradeType: partial.tradeType,
    giving,
    receiving,
    givingItems: giving,
    receivingItems: receiving,
    givingTotal,
    receivingTotal,
    diff,
    givingRap,
    receivingRap,
    rapDiff,
    counterMode: partial.counterMode || "NO_SIMPLE_COUNTER",
    counterTarget: Math.max(0, Math.round(n(partial.counterTarget))),
    counterReason: partial.counterReason || "",
    opPaid: n(partial.opPaid),
    opReceived: n(partial.opReceived),
    requiredOp: n(partial.requiredOp),
    expectedOp: n(partial.expectedOp),
    adjustedAllowedOp: n(partial.adjustedAllowedOp),
    headroom: n(partial.headroom),
    roomDiscount: n(partial.roomDiscount),
    suggestedMove: partial.suggestedMove || (
      String(partial.verdict).includes("✅") ? "Accept" :
      String(partial.verdict).includes("❌") ? "Counter" :
      "Maybe"
    ),
    reasons: [...(extraReasons || []), ...(partial.reasons || [])]
  };
}

const ROTORI_VALUE_TIER_LINES = [
  [4000, 3500],
  [5000, 4000],
  [6000, 5000],
  [7000, 6000],
  [22000, 20000],

  // ADD THE REST OF YOUR REAL VALUE TIERS HERE.
  // Format: [currentValue, previousRapLine]
];

function previousRapTierForItem(item) {
  const explicit = n(
    item?.previousRapTier ||
    item?.previousRapTierLine ||
    item?.prevRapTier ||
    item?.previousValueTier ||
    item?.previousValueRapTier ||
    item?.valueTierPreviousRap
  );

  if (explicit > 0) return explicit;

  const value = n(item?.baseValue || item?.value);
  if (!value) return 0;

  const exact = ROTORI_VALUE_TIER_LINES.find(([tierValue]) => {
    return n(tierValue) === value;
  });

  return exact ? n(exact[1]) : 0;
}

function rotoriParseSaleTimeMs(raw) {
  if (typeof raw === "number") {
    return raw < 10_000_000_000 ? raw * 1000 : raw;
  }

  const text = String(raw || "").trim();
  if (!text) return 0;

  const direct = Date.parse(text);
  if (Number.isFinite(direct)) return direct;

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
  );

  if (!match) return 0;

  let [, year, month, day, hour, minute, second, ampm] = match;
  year = Number(year);
  month = Number(month);
  day = Number(day);
  hour = Number(hour);
  minute = Number(minute);
  second = Number(second || 0);

  if (ampm) {
    const p = ampm.toUpperCase();
    if (p === "PM" && hour < 12) hour += 12;
    if (p === "AM" && hour === 12) hour = 0;
  }

  return new Date(year, month - 1, day, hour, minute, second).getTime();
}

function rotoriSaleTimeMs(sale) {
  return rotoriParseSaleTimeMs(
    sale?.time ||
    sale?.date ||
    sale?.soldAt ||
    sale?.createdAt ||
    sale?.timestamp
  );
}

function rotoriSaleNewRap(sale) {
  return n(
    sale?.newRap ||
    sale?.newRAP ||
    sale?.new_rap ||
    sale?.newRecentAveragePrice
  );
}

function rotoriPreviousTierInfo(item) {
  if (!item || !item.isValued) return null;

  const value = n(item.baseValue || item.value);
  const rap = n(item.rap || item.recentAveragePrice);
  const previousTier = previousRapTierForItem(item);

  if (!value || !rap || !previousTier) return null;

  // RULE CHANGE: Item is only eligible for drop watch if RAP is 500+ below the previous tier line.
  const gapBelowTier = previousTier - rap;
  if (gapBelowTier < 500) return null;

  const directHours = n(
    item.previousTierHoursUnder ||
    item.hoursUnderPreviousTier ||
    item.hoursBelowPreviousRapTier
  );
  const directPercent = n(
    item.previousTierUnderPercent ||
    item.previousTierBelowPercent ||
    item.percentUnderPreviousTier
  );

  if (directHours >= 24) {
    return {
      previousRapTierLine: previousTier,
      previousTierHoursUnder: directHours,
      previousTierWindowHours: directHours,
      previousTierUnderPercent: directPercent || 100,
      previousTierDataMissing: false
    };
  }

  const sales = Array.isArray(item.sales)
    ? item.sales
    : Array.isArray(item.recentSales)
      ? item.recentSales
      : [];

  const ordered = sales
    .map(sale => ({
      timeMs: rotoriSaleTimeMs(sale),
      newRap: rotoriSaleNewRap(sale)
    }))
    .filter(x => x.timeMs > 0 && x.newRap > 0)
    .sort((a, b) => a.timeMs - b.timeMs);

  if (!ordered.length) {
    return {
      previousRapTierLine: previousTier,
      previousTierHoursUnder: 0,
      previousTierWindowHours: 0,
      previousTierUnderPercent: 0,
      previousTierDataMissing: true
    };
  }

  const latestTime = ordered[ordered.length - 1].timeMs;
  const windowHours = 24;
  const cutoff = latestTime - windowHours * 60 * 60 * 1000;
  const recent = ordered.filter(x => x.timeMs >= cutoff);

  if (recent.length < 5) {
    return {
      previousRapTierLine: previousTier,
      previousTierHoursUnder: 0,
      previousTierWindowHours: 0,
      previousTierUnderPercent: 0,
      previousTierDataMissing: true
    };
  }

  const underCount = recent.filter(x => x.newRap < previousTier).length;
  const underRatio = underCount / recent.length;

  let continuousUnderSince = 0;
  for (const entry of ordered) {
    if (entry.newRap < previousTier) {
      if (!continuousUnderSince) continuousUnderSince = entry.timeMs;
    } else {
      continuousUnderSince = 0;
    }
  }

  const continuousHours = continuousUnderSince
    ? Math.round((latestTime - continuousUnderSince) / 36e5)
    : 0;

  const qualifies = continuousHours >= 24 || underRatio >= 0.9;
  if (!qualifies) {
    return {
      previousRapTierLine: previousTier,
      previousTierHoursUnder: continuousHours,
      previousTierWindowHours: windowHours,
      previousTierUnderPercent: Math.round(underRatio * 100),
      previousTierDataMissing: false,
      previousTierSoftWatch: true
    };
  }

  return {
    previousRapTierLine: previousTier,
    previousTierHoursUnder: Math.max(continuousHours, windowHours),
    previousTierWindowHours: windowHours,
    previousTierUnderPercent: Math.round(underRatio * 100),
    previousTierDataMissing: false
  };
}

function applyPreviousTierDropWatch(item) {
  const info = rotoriPreviousTierInfo(item);
  if (!info) return item;

  const value = n(item.baseValue || item.value);
  const rap = n(item.rap || item.recentAveragePrice);
  const reason = info.previousTierDataMissing
    ? `${itemLabel(item)} is on previous-tier watch: value ${fmtNum(value)}, RAP ${fmtNum(rap)}, and it is under the ${fmtNum(info.previousRapTierLine)} previous RAP tier. Rotori could not verify the hours because sales history was not attached to this item.`
    : `${itemLabel(item)} is on previous-tier watch: value ${fmtNum(value)}, RAP ${fmtNum(rap)}, previous tier ${fmtNum(info.previousRapTierLine)}, and ${fmtNum(info.previousTierUnderPercent)}% of the last ${fmtNum(info.previousTierWindowHours)} hours stayed under that line.`;

  return {
    ...item,
    previousTierDropWatch: true,
    previousRapTierLine: info.previousRapTierLine,
    previousTierHoursUnder: info.previousTierHoursUnder,
    previousTierWindowHours: info.previousTierWindowHours,
    previousTierUnderPercent: info.previousTierUnderPercent,
    previousTierDataMissing: !!info.previousTierDataMissing,
    previousTierSoftWatch: !!info.previousTierSoftWatch,
    previousTierReason: reason
  };
}

function cleanItem(item) {
  const projected = !!(item.projected || item.isProjected);
  const directBaselineRap = n(
    item.baselineRap ||
    item.projectedBaseline ||
    item.preProjectionRap ||
    item.hyperBaselineRap
  );
  const inferredBaselineRap = inferProjectedBaselineRap(item);
  const baselineRap = inferredBaselineRap > 0 ? inferredBaselineRap : directBaselineRap;
  const sales = Array.isArray(item.sales)
    ? item.sales
    : Array.isArray(item.recentSales)
      ? item.recentSales
      : [];

  const cleaned = {
    ...item,
    isValued: !!item.isValued || n(item.value || item.baseValue) > 0,
    rap: n(item.rap || item.recentAveragePrice),
    value: n(item.value),
    baseValue: n(item.baseValue || item.value || item.rap),
    demand: normalizeDemand(item.demand),
    trend: normalizeTrend(item.trend),
    projected,
    isProjected: projected,
    isActualProjected: projected,
    baselineRap,
    projectedBaseline: baselineRap,
    preProjectionRap: baselineRap,
    sales,
    recentSales: sales,
    previousRapTier: n(item.previousRapTier),
    previousRapTierLine: n(item.previousRapTierLine || item.previousRapTier),
    previousTierHoursUnder: n(item.previousTierHoursUnder),
    previousTierWindowHours: n(item.previousTierWindowHours),
    previousTierUnderPercent: n(item.previousTierUnderPercent),
    previousTierDropWatch: !!item.previousTierDropWatch,
    previousTierReason: item.previousTierReason || "",
    isLowRapNow: !!item.isLowRapNow,
    lowAdjustedRap: n(item.lowAdjustedRap),
    lowRapReason: item.lowRapReason || "",
    dropWatch: !!item.dropWatch,
    dropEligible: !!item.dropEligible,
    isDropping: !!item.isDropping || !!item.dropEligible,
    dropOriginalValue: n(item.dropOriginalValue || item.baseValue || item.value),
    dropAdjustedValue: n(item.dropAdjustedValue),
    dropValueLoss: n(item.dropValueLoss),
    dropCriticalRapLine: n(item.dropCriticalRapLine),
    dropGuardGap: n(item.dropGuardGap),
    dropHoursCritical: n(item.dropHoursCritical),
    dropHoursNeeded: n(item.dropHoursNeeded),
    dropHoursUntilEligible: n(item.dropHoursUntilEligible),
    dropLowSaleDetected: !!item.dropLowSaleDetected,
    dropReason: item.dropReason || ""
  };

  return applyPreviousTierDropWatch(cleaned);
}
function analyzeTradeCore(givingRaw, receivingRaw, options = {}) {
  const giving = (givingRaw || []).map(cleanItem).map(item => {
    // Projected wins over hyper-inflated.
    // If Rolimons says it is projected, do NOT show the hyper-inflated warning.
    if (item.isHyperInflated && isActuallyProjected(item)) {
      return {
        ...item,
        isHyperInflated: false,
        ownedHyperInflated: false
      };
    }

    // Hyper-only outgoing item: warn, but do not deflate our own side.
    if (item.isHyperInflated && !item.isValued) {
      return {
        ...item,
        projected: false,
        isProjected: false,
        isActualProjected: false,
        ownedHyperInflated: true
      };
    }

    return item;
  });

  const receiving = (receivingRaw || []).map(cleanItem).map(item => {
    // Projected wins over hyper-inflated.
    // If Rolimons says it is projected, keep it projected and hide hyper wording.
    if (item.isHyperInflated && isActuallyProjected(item)) {
      return {
        ...item,
        isHyperInflated: false,
        ownedHyperInflated: false
      };
    }

    // Hyper-only incoming item: use baseline math for safety,
    // but still label it as hyper-inflated, not projected.
    if (item.isHyperInflated && !item.isValued) {
      const hyperBaseline = n(
        item.hyperBaselineRap ||
        item.baselineRap ||
        item.projectedBaseline
      );

      return {
        ...item,
        projected: true,
        isProjected: true,
        isActualProjected: false,
        hyperAdjustedProjection: true,
        baselineRap: hyperBaseline,
        projectedBaseline: hyperBaseline
      };
    }

    return item;
  });

  const givingRobux = n(options.givingRobux);
  const receivingRobux = n(options.receivingRobux);

  giving.rotoriRobux = givingRobux;
  receiving.rotoriRobux = receivingRobux;

const blockedFaceItem = [...giving, ...receiving].find(isFaceBlockedItem);

if (blockedFaceItem) {
  return baseResult({
    verdict: "❌ Unable to Analyze",
    tradeType: "FACE ITEM BLOCKED",
    counterMode: "NO_SIMPLE_COUNTER",
    counterTarget: 0,
    reasons: [
      "face items cant be tracked right now, update coming soon"
    ]
  }, giving, receiving, [
    `${itemLabel(blockedFaceItem)} appears to be a face item / unknown-sale-status item.`
  ]);
}

  const reasons = [];
  addItemPerformanceNotes(giving, receiving, reasons);

  if (!giving.length || !receiving.length) {
    return baseResult({
      verdict: "❌ Could not read trade",
      tradeType: "UNKNOWN",
      reasons: ["Rotori did not get resolved items for both sides."]
    }, giving, receiving, reasons);
  }


  if (giving.length === 1 && receiving.length === 1) {
    return baseResult(analyzeOneForOne(giving, receiving), giving, receiving, reasons);
  }

  const tradeType = classifyTradeType(giving, receiving, reasons);
  const givingTotal = sum(giving, tradeMetric);
  const receivingTotal = sum(receiving, tradeMetric);
  const diff = receivingTotal - givingTotal;
  const rapDiff = sum(receiving, i => n(i.rap)) - sum(giving, i => n(i.rap));

  if (tradeType === "DOWNGRADE") {
    const anchor = biggestBy(giving, shapeMetric);
const baseRequired = expectedOpDowngrade(anchor);

    const incomingBase = sum(receiving, effectiveMetric) + receivingRobux;

    const eligibleIncomingValueOP = sum(receiving, i => {
  if (!i.isValued || !anchor) return 0;

  const anchorValue = tradeMetric(anchor);
  const itemValue = tradeMetric(i);

  /*
    Special face downgrade rule:
    If you're downgrading a face-like valued item, count the OP on
    incoming valued items even if they are smaller than 70% of the anchor.
    Faces are usually traded more by OP/appeal than clean size alone.
  */
  if (isFaceLikeItem(anchor)) {
    return itemOP(i);
  }

  // Normal rule: only count valued OP from major pieces.
  if (itemValue >= anchorValue * 0.8) {
    return itemOP(i);
  }

  return 0;
});

  const incomingRapOP = sum(receiving, i => {
  if (i.isValued || !anchor) return 0;

  // Use raw/visible size for OP-count eligibility.
  // Hyper-inflated/projected items may use a safer baseline for profit math,
  // but small filler should not count OP just because the anchor got de-projected.
  const anchorShapeValue = shapeMetric(anchor);
  const itemShapeValue = shapeMetric(i);

  // Do NOT count RAP OP from small downgrade filler pieces.
  // Only count RAP OP if the incoming RAP item is a major piece,
  // at least 70% of the raw item you're downgrading.
  if (itemShapeValue >= anchorShapeValue * 0.7) {
    return itemOP(i);
  }

  return 0;
});

    const downgradeAdjustment = getDowngradeRequiredAdjustment(
  anchor,
  receiving,
  baseRequired
);

const required = downgradeAdjustment.required;

    const effectiveIncoming = incomingBase + eligibleIncomingValueOP + incomingRapOP;
    const opReceived = effectiveIncoming - (sum(giving, effectiveMetric) + givingRobux);
const gap = required - opReceived;

const hasProjectedDowngradeRisk =
  (anchor?.projected || anchor?.isProjected) ||
  receiving.some(i => (i.projected || i.isProjected) && !i.isValued);

// If a projected item is involved, do not allow the “close enough” buffer.
// The trade must beat the de-projected requirement cleanly.
const closeEnough = hasProjectedDowngradeRisk
  ? 0
  : Math.max(75, Math.round(required * 0.02));

    const r = [];
    r.push(`First, you're getting ${signedNum(opReceived)} OP here.`);
    if (eligibleIncomingValueOP > 0) r.push(`Counted ${fmtNum(eligibleIncomingValueOP)} value OP from incoming valued item(s) close enough to your main item.`);
    if (incomingRapOP > 0) {
  r.push(`Counted ${fmtNum(incomingRapOP)} RAP OP from big incoming RAP item(s) you could downgrade.`);
}
    for (const note of downgradeAdjustment.notes) {
  r.push(note);
}
    if (required !== baseRequired) {
  r.push(
    `For this downgrade from ${itemLabel(anchor)}, base required OP was ${fmtNum(baseRequired)}, adjusted to ${fmtNum(required)}.`
  );
} else {
  r.push(
    `For this downgrade from ${itemLabel(anchor)}, you probably want around ${fmtNum(required)} OP back.`
  );
}
    let verdict;
    let counterMode = "NO_SIMPLE_COUNTER";
    let counterTarget = 0;

    if (opReceived >= required || gap <= closeEnough) {
      verdict = "✅ Accept downgrade";
      if (gap > 0) {
  r.push(`It's only about ${fmtNum(gap)} OP off, close enough.`);
} else {
  if (hasProjectedDowngradeRisk) {
    r.push("This clears the required OP after checking projected/baseline values.");
  } else {
    r.push("This clears the required OP.");
  }
}
    } else if (opReceived >= required * 0.85) {
      verdict = "⚖️ Counter downgrade";
      counterMode = "THEM_REPLACE_OR_ADD";
      counterTarget = gap;
      r.push(`You're close, but counter for around ${fmtNum(gap)} more OP.`);
    } else {
      verdict = "❌ Decline downgrade";
      counterMode = "THEM_REPLACE_OR_ADD";
      counterTarget = gap;
      r.push(`You'd need around ${fmtNum(gap)} more to make this fine.`);
    }

    return baseResult({
      verdict,
      tradeType,
      opReceived,
      requiredOp: required,
      counterMode,
      counterTarget,
      counterReason: counterMode === "NO_SIMPLE_COUNTER" ? "" : "NEED_MORE_FOR_DOWNGRADE",
      reasons: r
    }, giving, receiving, reasons);
  }

  if (tradeType === "UPGRADE") {
    const target = biggest(receiving);
    const targetBase = tradeMetric(target);
    const giveCount = giving.length;
    const receiveCount = receiving.length;

    let ignoredValuedOP = 0;

const effectivePay = sum(giving, item => {
  const base = effectiveMetric(item);

  // Only count OP on outgoing items if they are at least 80%
  // of the main target item.
  const itemIsBigEnough = targetBase > 0 && tradeMetric(item) >= targetBase * 0.8;

  if (itemIsBigEnough) {
    return base + itemManualOP(item);
  }

  ignoredValuedOP += itemManualOP(item);
  return base;
});

const effectiveReceive = sum(receiving, effectiveMetric) + receivingRobux;

const effectivePayWithRobux = effectivePay + givingRobux;

const opPaid = Math.max(0, effectivePayWithRobux - effectiveReceive);
const opGained = Math.max(0, effectiveReceive - effectivePayWithRobux);
let maxAllowedOp = expectedOpUpgrade(target, giveCount, receiveCount);
const normalMaxAllowedOp = maxAllowedOp;
const projectedGive = giving.filter(i =>
  (i.projected || i.isProjected) &&
  !i.isValued &&
  safeProjectedRap(i) > 0
);

const projectedReceive = receiving.filter(i =>
  (i.projected || i.isProjected) &&
  !i.isValued &&
  safeProjectedRap(i) > 0
);

const netAfterDeproj = effectiveReceive - effectivePayWithRobux;

if (projectedGive.length && netAfterDeproj >= Math.max(500, Math.round(effectivePayWithRobux * 0.03))) {
  return baseResult({
    verdict: "✅ Accept upgrade (projected flip profit)",
    tradeType,
    opPaid: 0,
    opGained: netAfterDeproj,
    expectedOp: maxAllowedOp,
    adjustedAllowedOp: maxAllowedOp,
    headroom: maxAllowedOp,
    counterMode: "NO_SIMPLE_COUNTER",
    reasons: [
      `Projected item(s) on your side were valued at baseline RAP, not inflated RAP.`,
      `Effective net after de-projection is +${fmtNum(netAfterDeproj)}, so Rotori ignores the normal OP cap because the flip is profitable.`
    ]
  }, giving, receiving, reasons);
}

   

// Upgrade discount for weak target items.
// If our outgoing side is mostly MEDIUM+ demand, and the target is weak,
// Rotori lowers how much OP we are willing to pay.
const outgoingMostlyMediumPlus = majorityAtLeastMediumDemand(giving);

const weakTargetReasons = [];
if (isLowDemand(target)) weakTargetReasons.push("LOW DEMAND");
if (target?.projected || target?.isProjected) weakTargetReasons.push("projected risk");

let weakTargetDiscountPercent = 0;

if (outgoingMostlyMediumPlus && weakTargetReasons.length) {
  if (isLowDemand(target)) weakTargetDiscountPercent += 0.35;
  if (target?.projected || target?.isProjected) weakTargetDiscountPercent += 0.25;

  // Weak trend is only a warning now, not a discount.
  weakTargetDiscountPercent = Math.min(0.45, weakTargetDiscountPercent);
}

const shapePatch = rotoriUpgradeShapePatch(giveCount, receiveCount);
const shapeDiscountPercent = shapePatch.discountPercent;

// Keep your weak-target logic, but add upgrade-shape room on top.
const totalRoomDiscountPercent = Math.min(
  0.70,
  weakTargetDiscountPercent + shapeDiscountPercent
);

const roomDiscount = Math.round(normalMaxAllowedOp * totalRoomDiscountPercent);
maxAllowedOp = Math.max(0, normalMaxAllowedOp - roomDiscount);

const adjustedAllowedOp = maxAllowedOp;
const usage = adjustedAllowedOp > 0 ? opPaid / adjustedAllowedOp : (opPaid > 0 ? 999 : 0);
const headroom = adjustedAllowedOp - opPaid;

    const r = [];
    r.push(`First, this is an upgrade into ${itemLabel(target)}, around ${fmtNum(targetBase)}.`);
   r.push(`You're paying about ${fmtNum(opPaid)} OP on the full trade. The normal max before room discounts is around ${fmtNum(normalMaxAllowedOp)} OP.`);
// If the shape has a specific patch reason (like 4v1), show that.
if (shapePatch.reason) {
  r.push(`Upgrade shape check: ${shapePatch.reason}`);
} 
// If there was a discount applied, show the discount reason.
else if (roomDiscount > 0) {
  if (weakTargetReasons.length) {
    r.push(`Because ${itemLabel(target)} is ${weakTargetReasons.join(" / ")} and/or the upgrade shape needs room, Rotori lowers the upgrade cap by ${fmtNum(roomDiscount)} OP. New max is ${fmtNum(adjustedAllowedOp)} OP.`);
  } else {
    r.push(`Because of the ${giveCount}v${receiveCount} upgrade shape, Rotori lowers the upgrade cap by ${fmtNum(roomDiscount)} OP. New max is ${fmtNum(adjustedAllowedOp)} OP.`);
  }
} 
// Only show the generic "no discount" message if we haven't already pushed a specific shape reason.
else if (giveCount > receiveCount) {
  r.push(`This ${giveCount}v${receiveCount} upgrade shape does not need a shape discount.`);
}

    r.push(`After the room check, I want you at ${fmtNum(adjustedAllowedOp)} OP or less. Headroom is ${signedNum(headroom)}.`);
   if (ignoredValuedOP > 0) {
  r.push(
    `Ignored ${fmtNum(ignoredValuedOP)} OP from outgoing item(s) because they are under 80% of ${itemLabel(target)}. Rotori only counts outgoing OP when the item is big enough compared to the main upgrade target.`
  );
}
   const targetIsWeakForUpgrade = isLowDemand(target) || isWeakTrend(target) || target?.projected || target?.isProjected;
    const targetHasRealStrength = !targetIsWeakForUpgrade && (isHighDemand(target) || isGoodTrend(target));

    if (targetHasRealStrength) {
      r.push(`${itemLabel(target)} has strong demand/trend, so it gets a little breathing room.`);
    }

    // FIX: Only complain about the target being "weaker" if we are actually giving good items away.
    // If outgoingMostlyMediumPlus is false, it means we're giving small items or low-demand junk,
    // so any upgrade is a positive move regardless of the target's quality.
    if (targetIsWeakForUpgrade && outgoingMostlyMediumPlus) {
      r.push(`${itemLabel(target)} looks weaker from demand/trend/projected checks, so the max OP is stricter.`);
    }

    let verdict;
    let counterMode = "NO_SIMPLE_COUNTER";
    let counterTarget = 0;

    if (opPaid > maxAllowedOp) {
      verdict = "❌ Decline upgrade";
      counterMode = "THEM_SMALL_ADD_OR_REPLACE";
      counterTarget = Math.max(1, opPaid - adjustedAllowedOp);
      r.push(`You're over the hard max by about ${fmtNum(opPaid - maxAllowedOp)} OP.`);
    } else if (opPaid > adjustedAllowedOp || usage >= 0.85) {
      verdict = "⚠️ Too thin — skip";
      counterMode = "THEM_SMALL_ADD_OR_REPLACE";
      counterTarget = Math.max(1, opPaid - adjustedAllowedOp);
      r.push(`This is too close to max for a clean flip. You're using about ${Math.round(usage * 100)}% of the OP room.`);
    } else if (usage <= 0.5 || opGained > 0) {
      // FIX: Only label it a "weak target" in the verdict if you were giving good items for it.
      const showWeakSuffix = targetIsWeakForUpgrade && outgoingMostlyMediumPlus;
      verdict = showWeakSuffix ? "✅ Good value upgrade, but weak target" : "✅ Great upgrade";

      if (opGained > 0) {
        r.push(`You are not paying OP here — you are gaining about ${fmtNum(opGained)} while upgrading.`);
      } else {
        r.push(`This keeps room to flip. You're using about ${Math.round(Math.max(0, usage) * 100)}% of the allowed OP.`);
      }
    } else {
      verdict = "⚖️ Fair upgrade";
      r.push(`This is not awful, but it is not a strong profit upgrade. You're using about ${Math.round(usage * 100)}% of OP room.`);
    }

    return baseResult({
      verdict,
      tradeType,
      opPaid,
      opGained,
      expectedOp: maxAllowedOp,
      adjustedAllowedOp,
      roomDiscount,
      headroom,
      counterMode,
      counterTarget,
      counterReason: counterMode === "NO_SIMPLE_COUNTER" ? "" : "LOWER_OUR_OP_UNDER_MAX",
      reasons: r
    }, giving, receiving, reasons);
  }

  const qualityDiff =
    (sum(receiving, performanceScore) / Math.max(1, receiving.length)) -
    (sum(giving, performanceScore) / Math.max(1, giving.length));

  const r = [];
  r.push(`First, the value swing is ${signedNum(diff)}.`);
  r.push(`The RAP side is ${signedNum(rapDiff)}, so that's the backup check here.`);
  r.push(`Item performance swing is ${qualityDiff >= 0 ? "+" : ""}${qualityDiff.toFixed(1)}.`);

  let verdict;
  let counterMode = "NO_SIMPLE_COUNTER";
  let counterTarget = 0;

  if (diff > 0 && qualityDiff >= -1) {
    verdict = `✅ Good even trade: +${fmtNum(diff)}`;
  } else if (diff < 0 && qualityDiff <= 0) {
    verdict = `❌ Bad even trade: ${fmtNum(diff)}`;
    counterMode = "THEM_REPLACE_OR_ADD";
    counterTarget = Math.abs(diff);
    r.push("You lose value/RAP and you are not getting better item performance back.");
  } else if (diff < 0) {
  const loss = Math.abs(diff);
  const lossPct = givingTotal > 0 ? loss / givingTotal : 1;
  const smallLoss = loss <= Math.max(75, Math.round(givingTotal * 0.04));
  const qualityUpgrade = qualityDiff >= 2;

  if (smallLoss && qualityUpgrade) {
    verdict = "⚖️ Fair quality trade";
    r.push(
      `You lose ${fmtNum(loss)}, but it is only about ${Math.round(lossPct * 100)}% and their item quality is clearly better.`
    );
  } else {
    verdict = `❌ Bad even trade: ${fmtNum(diff)}`;
    counterMode = "THEM_REPLACE_OR_ADD";
    counterTarget = loss;
    r.push(
      `You lose ${fmtNum(loss)} after projected/baseline math. Better item quality does not justify that much loss.`
    );
  }
} else {
    verdict = "⚖️ Fair even trade";
    r.push("If you don't really want their items, don't force it just because the numbers are close.");
  }

  return baseResult({
    verdict,
    tradeType,
    counterMode,
    counterTarget,
    counterReason: counterMode === "NO_SIMPLE_COUNTER" ? "" : "EVEN_TRADE_NEEDS_MORE",
    reasons: r
  }, giving, receiving, reasons);
}

module.exports = {
  analyzeTradeCore
};
