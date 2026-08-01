/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const README_PATH = path.join(__dirname, '../README.md');
const REPORT_PATH = path.join(__dirname, '../broken-links-report.json');

const CONCURRENCY = 5;
const NAV_TIMEOUT_MS = 20000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function extractLinks(readmeContent) {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(readmeContent)) !== null) {
    links.push({ title: match[1], url: match[2] });
  }
  return links;
}

async function checkLink(browser, link) {
  const page = await browser.newPage({ userAgent: USER_AGENT });
  try {
    const response = await page.goto(link.url, {
      waitUntil: 'networkidle',
      timeout: NAV_TIMEOUT_MS,
    });

    if (!response) {
      return { link, broken: true, error: 'No response from navigation' };
    }

    const status = response.status();
    if (status === 403 || status === 429) {
      return { link, warning: status };
    }
    if (!response.ok()) {
      return { link, broken: true, status };
    }
    return { link, ok: true };
  } catch (error) {
    return { link, broken: true, error: error.message };
  } finally {
    await page.close();
  }
}

async function main() {
  const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
  const links = extractLinks(readmeContent);
  console.log(`Found ${links.length} links to check (browser-based, this will take a while).`);

  const browser = await chromium.launch();
  const broken = [];
  const warnings = [];

  try {
    for (let i = 0; i < links.length; i += CONCURRENCY) {
      const chunk = links.slice(i, i + CONCURRENCY);
      const results = await Promise.all(chunk.map((link) => checkLink(browser, link)));
      for (const result of results) {
        if (result.broken) {
          broken.push({ ...result.link, status: result.status, error: result.error });
          console.error(`Broken: [${result.link.title}](${result.link.url}) - ${result.status ?? result.error}`);
        } else if (result.warning) {
          warnings.push({ ...result.link, status: result.warning });
        } else {
          process.stdout.write('.');
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n\nChecked ${links.length} links: ${broken.length} broken, ${warnings.length} bot-blocked (not counted as dead).`);
  fs.writeFileSync(REPORT_PATH, JSON.stringify({ checkedAt: new Date().toISOString(), broken, warnings }, null, 2));

  if (broken.length > 0) process.exitCode = 1;
}

main();
