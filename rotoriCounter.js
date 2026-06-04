// rotoriCounter.js
// Counter-suggestion helper for Rotori extension.
// Keeps counter logic separate from the main analyzer UI.

window.RotoriCounter = (() => {
  const inventoryCache = new Map();
  const CACHE_MS = 2 * 60 * 1000;

  function cleanUsername(username) {
    return String(username || "")
      .replace(/^@/, "")
      .trim();
  }

  function getTradePartnerUsername() {
    const text = document.body.innerText || "";

    // Looks for @Username on the trade page.
    const match = text.match(/@([A-Za-z0-9_]{3,20})/);

    if (!match) return null;

    return cleanUsername(match[1]);
  }

  async function usernameToUserId(username) {
    username = cleanUsername(username);

    const res = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to resolve username: HTTP ${res.status}`);
    }

    const json = await res.json();
    const user = json?.data?.[0];

    if (!user?.id) {
      throw new Error(`Could not find Roblox userId for @${username}`);
    }

    return user.id;
  }

  async function fetchCollectibles(userId) {
    const cacheKey = String(userId);
    const cached = inventoryCache.get(cacheKey);

    if (cached && Date.now() - cached.time < CACHE_MS) {
      return cached.items;
    }

    let cursor = "";
    const allItems = [];

    for (let page = 0; page < 10; page++) {
      const url =
        `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles` +
        `?sortOrder=Asc&limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Could not read inventory: HTTP ${res.status}`);
      }

      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];

      allItems.push(...data);

      if (!json?.nextPageCursor) break;
      cursor = json.nextPageCursor;
    }

    inventoryCache.set(cacheKey, {
      time: Date.now(),
      items: allItems
    });

    return allItems;
  }

  function itemWorth(item) {
    return Number(
      item.value ||
      item.baseValue ||
      item.recentAveragePrice ||
      item.rap ||
      0
    );
  }

  function isBadTrend(item) {
    const trend = String(item.trend || "").toUpperCase();

    return (
      trend.includes("LOWERING") ||
      trend.includes("DROPPING") ||
      trend.includes("NOT_HIGHERING_LOW_DEMAND")
    );
  }

  function isSafeCounterItem(item) {
    if (!item) return false;

    const worth = itemWorth(item);
    const demand = String(item.demand || "").toUpperCase();

    if (!Number.isFinite(worth) || worth <= 0) return false;
    if (item.projected === true) return false;
    if (item.isProjected === true) return false;
    if (item.isDropping === true) return false;
    if (isBadTrend(item)) return false;
    if (demand === "LOW") return false;

    return true;
  }

  function normalizeInventoryItem(raw) {
    return {
      id: String(raw.assetId || raw.id || ""),
      assetId: raw.assetId || raw.id,
      userAssetId: raw.userAssetId,
      name: raw.name || raw.assetName || "Unknown Item",
      rap: raw.recentAveragePrice || raw.rap || 0,
      recentAveragePrice: raw.recentAveragePrice || 0,

      // These get filled better later if your analyzer/server decorates the item.
      value: raw.value || 0,
      baseValue: raw.baseValue || 0,
      demand: raw.demand || "UNKNOWN",
      trend: raw.trend || "UNKNOWN",
      projected: raw.projected || false,
      isDropping: raw.isDropping || false
    };
  }

 function itemNameKey(item) {
  return String(item?.name || item?.assetName || item || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function countItemsByName(items) {
  const counts = new Map();

  for (const item of items || []) {
    const key = itemNameKey(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return counts;
}

function pickAddItems(otherInventory, neededAmount, receivingItems = []) {
  const normalizedInventory = otherInventory.map(normalizeInventoryItem);

  const inventoryCounts = countItemsByName(normalizedInventory);
  const alreadyInTradeCounts = countItemsByName(receivingItems);
  const usedExtraCounts = new Map();

  const safeItems = normalizedInventory
    .filter(isSafeCounterItem)
    .filter(item => {
      const key = itemNameKey(item);
      const alreadyInTrade = alreadyInTradeCounts.get(key) || 0;

      if (alreadyInTrade === 0) return true;

      const totalOwned = inventoryCounts.get(key) || 0;
      const extraCopies = totalOwned - alreadyInTrade;
      const usedExtras = usedExtraCounts.get(key) || 0;

      if (extraCopies <= usedExtras) return false;

      usedExtraCounts.set(key, usedExtras + 1);
      return true;
    })
    .sort((a, b) => itemWorth(a) - itemWorth(b));

  const min = Math.max(100, neededAmount);
  const max = Math.ceil(min * 1.35 + 250);

  const single = safeItems.find(item => {
    const worth = itemWorth(item);
    return worth >= min && worth <= max;
  });

  if (single) return [single];

  const biggerSingle = safeItems.find(item => itemWorth(item) >= min);
  if (biggerSingle) return [biggerSingle];

  for (let i = 0; i < safeItems.length; i++) {
    for (let j = i + 1; j < safeItems.length; j++) {
      const total = itemWorth(safeItems[i]) + itemWorth(safeItems[j]);

      if (total >= min && total <= max) {
        return [safeItems[i], safeItems[j]];
      }
    }
  }

  return [];
}

function buildExplanation({ type, username, neededAmount, picks, removeItem }) {
  if (type === "ASK_THEM_TO_ADD") {
    const total = picks.reduce((sum, item) => sum + itemWorth(item), 0);
    const names = picks.map(item => `${item.name} (~${itemWorth(item).toLocaleString()})`).join(" + ");

    return {
      title: "Suggested Counter",
      text:
        `You should counter @${username} and ask them to add **${names}**. ` +
        `You were short by about **${neededAmount.toLocaleString()}**, and this adds around **${total.toLocaleString()}** using safer inventory items.`
    };
  }

  if (type === "YOU_LOWER_SIDE") {
    if (!removeItem) {
      return {
        title: "Suggested Counter",
        text:
          `You are giving too much by about **${neededAmount.toLocaleString()}**. ` +
          `Counter by lowering your side around that amount. Rotori could not pick one exact item because the trade items did not include item values yet.`
      };
    }

    return {
      title: "Suggested Counter",
      text:
        `You are giving too much by about **${neededAmount.toLocaleString()}**. ` +
        `Counter by removing or swapping **${removeItem.name}** ` +
        `(~${itemWorth(removeItem).toLocaleString()}) from your side.`
    };
  }

  if (type === "THEM_ADD_ITEM") {
    const total = picks.reduce((sum, item) => sum + itemWorth(item), 0);

    if (!picks.length) {
      return {
        title: "Suggested Counter",
        text:
          `@${username} needs to add around **${neededAmount.toLocaleString()}**, ` +
          `but Rotori could not find a clean safe item from their visible inventory.`
      };
    }

    const names = picks
      .map(item => `${item.name} (~${itemWorth(item).toLocaleString()})`)
      .join(" + ");

    return {
      title: "Suggested Counter",
      text:
        `@${username} should add **${names}**. ` +
        `That adds around **${total.toLocaleString()}** and avoids items already in the trade unless they own an extra copy.`
    };
  }

  return {
    title: "Suggested Counter",
    text: "This trade does not need a simple counter."
  };
}

function pickVisibleTradeItemToRemove(givingItems, amountTooHigh) {
  const items = [...(givingItems || [])]
    .filter(item => item && String(item.id) !== "robux")
    .map(item => ({
      ...item,
      worth: itemWorth(item)
    }))
    .filter(item => item.worth > 0)
    .sort((a, b) => {
      const aDistance = Math.abs(a.worth - amountTooHigh);
      const bDistance = Math.abs(b.worth - amountTooHigh);
      return aDistance - bDistance;
    });

  return items[0] || null;
}

function getAvailableInventoryItems(otherInventory, receivingItems = []) {
  const normalizedInventory = otherInventory.map(normalizeInventoryItem);

  const inventoryCounts = countItemsByName(normalizedInventory);
  const alreadyInTradeCounts = countItemsByName(receivingItems);
  const usedExtraCounts = new Map();

  return normalizedInventory
    .filter(isSafeCounterItem)
    .filter(item => {
      const key = itemNameKey(item);
      const alreadyInTrade = alreadyInTradeCounts.get(key) || 0;

      if (alreadyInTrade === 0) return true;

      const totalOwned = inventoryCounts.get(key) || 0;
      const extraCopies = totalOwned - alreadyInTrade;
      const usedExtras = usedExtraCounts.get(key) || 0;

      if (extraCopies <= usedExtras) return false;

      usedExtraCounts.set(key, usedExtras + 1);
      return true;
    });
}

function counterTargetRange(target) {
  const min = Math.max(1, Math.round(Number(target || 0)));

  // Prevents insane counters like adding 10k for a 197 gap.
  // Example: target 197 -> max around 347.
  const max = min + Math.max(150, Math.round(min * 0.75));

  return { min, max };
}

function counterPlanScore(gain, target) {
  gain = Number(gain || 0);
  target = Number(target || 0);

  const over = Math.max(0, gain - target);
  const under = Math.max(0, target - gain);

  // Being under is worse than being slightly over.
  return Math.abs(gain - target) + under * 2 + over * 0.35;
}

function sortByClosestGain(candidates, target) {
  return candidates.sort((a, b) => {
    const aScore = counterPlanScore(a.netGain, target);
    const bScore = counterPlanScore(b.netGain, target);

    if (aScore !== bScore) return aScore - bScore;

    return a.netGain - b.netGain;
  });
}

function buildAddPlan(available, target, maxTradeSlots = 4, currentSlots = 0) {
  const { min, max } = counterTargetRange(target);
  const openSlots = Math.max(0, maxTradeSlots - currentSlots);

  if (openSlots <= 0) return null;

  const safe = [...available]
    .filter(item => {
      const worth = itemWorth(item);
      return worth >= min && worth <= max;
    })
    .sort((a, b) => itemWorth(a) - itemWorth(b));

  const singleCandidates = safe.map(item => ({
    action: "ADD",
    addItems: [item],
    removeItems: [],
    netGain: itemWorth(item)
  }));

  if (singleCandidates.length) {
    return sortByClosestGain(singleCandidates, target)[0];
  }

  // Only try 2-item adds if there is room and target is not tiny.
  if (openSlots < 2 || target < 300) return null;

  const smallPool = [...available]
    .filter(item => {
      const worth = itemWorth(item);
      return worth > 0 && worth <= max;
    })
    .sort((a, b) => itemWorth(a) - itemWorth(b))
    .slice(0, 80);

  const pairCandidates = [];

  for (let i = 0; i < smallPool.length; i++) {
    for (let j = i + 1; j < smallPool.length; j++) {
      const a = smallPool[i];
      const b = smallPool[j];
      const total = itemWorth(a) + itemWorth(b);

      if (total >= min && total <= max) {
        pairCandidates.push({
          action: "ADD",
          addItems: [a, b],
          removeItems: [],
          netGain: total
        });
      }
    }
  }

  if (pairCandidates.length) {
    return sortByClosestGain(pairCandidates, target)[0];
  }

  return null;
}

function buildReplacePlan(currentItems, available, target) {
  const { min, max } = counterTargetRange(target);
  const candidates = [];

  for (const oldItem of currentItems || []) {
    const oldWorth = itemWorth(oldItem);
    if (oldWorth <= 0) continue;

    for (const newItem of available || []) {
      const newWorth = itemWorth(newItem);
      if (newWorth <= 0) continue;

      const gain = newWorth - oldWorth;

      if (gain < min || gain > max) continue;

      candidates.push({
        action: "REPLACE",
        addItems: [newItem],
        removeItems: [oldItem],
        netGain: gain
      });
    }
  }

  if (!candidates.length) return null;

  return sortByClosestGain(candidates, target)[0];
}

function buildYourSideLowerPlan({
  inventory,
  givingItems = [],
  target
}) {
  const { min, max } = counterTargetRange(target);

  const currentGiving = [...(givingItems || [])]
    .map(item => ({
      ...item,
      worth: itemWorth(item)
    }))
    .filter(item => item.worth > 0)
    .sort((a, b) => itemWorth(a) - itemWorth(b));

  const available = getAvailableInventoryItems(inventory || [], givingItems)
    .filter(isSafeCounterItem)
    .sort((a, b) => itemWorth(a) - itemWorth(b));

  const candidates = [];

  // Option 1: remove one of your smaller items if there are multiple items.
  // Do not suggest removing your only item.
  if (currentGiving.length > 1) {
    for (const oldItem of currentGiving) {
      const worth = itemWorth(oldItem);

      if (worth >= min && worth <= max) {
        candidates.push({
          action: "YOU_REMOVE",
          addItems: [],
          removeItems: [oldItem],
          netGain: worth
        });
      }
    }
  }

  // Option 2: swap one of your items for a cheaper safe item from your inventory.
  for (const oldItem of currentGiving) {
    const oldWorth = itemWorth(oldItem);

    for (const newItem of available) {
      const newWorth = itemWorth(newItem);
      const saved = oldWorth - newWorth;

      if (saved < min || saved > max) continue;

      candidates.push({
        action: "YOU_REPLACE",
        addItems: [newItem],
        removeItems: [oldItem],
        netGain: saved
      });
    }
  }

  if (!candidates.length) return null;

  return sortByClosestGain(candidates, target)[0];
}
function getReceivingSlotCount(receivingItems = []) {
  // Normal case: use the items Rotori already parsed.
  let count = Array.isArray(receivingItems) ? receivingItems.length : 0;

  // Backup: Roblox trades max out at 4 items per side.
  // If Rotori sees 4 resolved receiving items, treat their side as full.
  if (count >= 4) return 4;

  return count;
}
function buildTheirSideCounterPlan({
  inventory,
  receivingItems = [],
  target,
  mode,
  currentDiff
}) {
  const available = getAvailableInventoryItems(inventory || [], receivingItems)
    .filter(isSafeCounterItem)
    .sort((a, b) => itemWorth(a) - itemWorth(b));

  const currentReceiving = [...(receivingItems || [])]
    .map(item => ({
      ...item,
      worth: itemWorth(item)
    }))
    .filter(item => item.worth > 0)
    .sort((a, b) => itemWorth(a) - itemWorth(b));

  const receivingSlotCount = getReceivingSlotCount(receivingItems);
  const receivingSideIsFull = receivingSlotCount >= 4;

  // If their side already has 4 items, Roblox will not allow another add.
  // In that case, ONLY suggest replacing one of their current items.
  if (receivingSideIsFull) {
    const replaceOnlyPlan = buildReplacePlan(
      currentReceiving,
      available,
      target
    );

    return replaceOnlyPlan || null;
  }

  const addPlan = buildAddPlan(
    available,
    target,
    4,
    receivingSlotCount
  );

  const replacePlan = buildReplacePlan(
    currentReceiving,
    available,
    target
  );

  const plans = [addPlan, replacePlan].filter(Boolean);

  if (!plans.length) return null;

  return sortByClosestGain(plans, target)[0];
}

function buildCounterPlanExplanation({
  username,
  plan,
  target,
  mode,
  currentDiff
}) {
  target = Math.round(Number(target || 0));

  if (!plan) {
    return {
      title: "Suggested Counter",
      text:
        `Rotori could not find a clean counter. ` +
        `The trade only needs around **${target.toLocaleString()}** more, ` +
        `but the safe options found were either too small, already in the trade, projected/bad, or way too large. ` +
        `Do not force a huge item for a tiny gap.`
    };
  }

  const addText = (plan.addItems || [])
    .map(item => `${item.name} (~${itemWorth(item).toLocaleString()})`)
    .join(" + ");

  const removeText = (plan.removeItems || [])
    .map(item => `${item.name} (~${itemWorth(item).toLocaleString()})`)
    .join(" + ");

  const gainText = Math.round(plan.netGain || 0).toLocaleString();
  const targetText = target.toLocaleString();

  if (plan.action === "ADD") {
  return {
    title: "Suggested Counter",
    text:
      `Ask @${username} to add **${addText}**. ` +
      `That improves their side by about **${gainText}**. ` +
      `Rotori needed around **${targetText}** more, so this is the closest clean add it found.`
  };
}


  if (plan.action === "REPLACE") {
    return {
      title: "Suggested Counter",
      text:
        `Ask @${username} to replace **${removeText}** with **${addText}**. ` +
        `That improves their side by about **${gainText}**. ` +
        `Rotori needed around **${targetText}** more, so this is the closest clean replacement it found.`
    };
  }

  if (plan.action === "YOU_REMOVE") {
    return {
      title: "Suggested Counter",
      text:
        `Their inventory did not have a clean fit. ` +
        `The best counter from your side is to remove **${removeText}**. ` +
        `That lowers your side by about **${gainText}**, close to the **${targetText}** Rotori wanted.`
    };
  }

  if (plan.action === "YOU_REPLACE") {
    return {
      title: "Suggested Counter",
      text:
        `Their inventory did not have a clean fit. ` +
        `The best counter from your side is to replace **${removeText}** with **${addText}**. ` +
        `That lowers your side by about **${gainText}**, close to the **${targetText}** Rotori wanted.`
    };
  }

  return {
    title: "Suggested Counter",
    text:
      `Rotori could not build a clean counter. ` +
      `Do not force an oversized item just to fix a small gap.`
  };
}

async function suggestCounter({
  analyzeResult,
  givingItems = [],
  receivingItems = [],
  ownerUser = null
}) {
  const username = getTradePartnerUsername();

  if (!username) {
    throw new Error("Could not find the trade partner username on the page.");
  }

  const counterMode = String(analyzeResult?.counterMode || "");
  const target = Number(analyzeResult?.counterTarget || 0);

  if (
    counterMode !== "THEM_REPLACE_OR_ADD" &&
    counterMode !== "THEM_SMALL_ADD_OR_REPLACE"
  ) {
    return {
      title: "Suggested Counter",
      text: "Rotori could not find a clean counter for this trade yet."
    };
  }

  if (!Number.isFinite(target) || target <= 0) {
    return {
      title: "Suggested Counter",
      text: "Rotori does not see a real counter target here."
    };
  }

  const partnerUserId = await usernameToUserId(username);
  const partnerInventory = await fetchCollectibles(partnerUserId);

  const partnerPlan = buildTheirSideCounterPlan({
    inventory: partnerInventory,
    receivingItems,
    target,
    mode: counterMode,
    currentDiff: Number(analyzeResult?.diff || 0)
  });

  if (partnerPlan) {
    return buildCounterPlanExplanation({
      username,
      plan: partnerPlan,
      target,
      mode: counterMode,
      currentDiff: Number(analyzeResult?.diff || 0)
    });
  }

  // Fallback: use YOUR inventory to lower/swap your side instead.
  // content.js already passes ownerUser into suggestCounter.
  if (ownerUser?.id) {
    try {
      const myInventory = await fetchCollectibles(ownerUser.id);

      const myPlan = buildYourSideLowerPlan({
        inventory: myInventory,
        givingItems,
        target
      });

      if (myPlan) {
        return buildCounterPlanExplanation({
          username,
          plan: myPlan,
          target,
          mode: counterMode,
          currentDiff: Number(analyzeResult?.diff || 0)
        });
      }
    } catch (err) {
      console.warn("[Rotori] Could not scan your inventory for fallback counter:", err);
    }
  }

  return buildCounterPlanExplanation({
    username,
    plan: null,
    target,
    mode: counterMode,
    currentDiff: Number(analyzeResult?.diff || 0)
  });
}
  return {
  suggestCounter,
  getTradePartnerUsername,
  usernameToUserId,
  fetchCollectibles
};
})();