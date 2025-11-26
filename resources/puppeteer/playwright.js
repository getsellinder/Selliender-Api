import { chromium } from "playwright";

export const runPlaywrightAutomation = async (prompt) => {
  const text = prompt.toLowerCase();

  let url = "";
  let searchQuery = "";

  // Extract URL
  const urlMatch = text.match(/(go to|open)\s+([^\s]+)/);
  if (urlMatch) {
    let rawUrl = urlMatch[2];
    url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}.com`;
  }

  // Extract Search Query
  if (text.includes("search for")) {
    searchQuery = text.split("search for")[1].trim();
  } else if (text.includes("search")) {
    searchQuery = text.split("search")[1].trim();
  }

  if (!url) return { error: "No website found in prompt" };

  console.log("🌍 Opening:", url);
  console.log("🔍 Searching:", searchQuery);

  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // UNIVERSAL SEARCH LOGIC
  const inputSelectors = [
    "input[type='search']",
    "input[placeholder*='Search']",
    "input[placeholder*='search']",
    "input[name='search']",
    "input[id*='search']",
    "input[name*='q']",
    "input[type='text']",
    "input[type='search']",
  ];

  let found = false;

  for (const selector of inputSelectors) {
    try {
      await page.waitForSelector(selector, { timeout: 2000 });
      await page.fill(selector, searchQuery);
      await page.keyboard.press("Enter");
      found = true;
      break;
    } catch {}
  }

  if (!found) {
    return { error: "No search bar found on this site" };
  }

  return {
    message: "Universal search completed",
    site: url,
    query: searchQuery
  };
};
