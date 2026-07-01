const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:4600/ui_design';
const OUT  = path.join(__dirname, 'screenshots');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const SCREENS = [
  { name: 'login',             fn: async (page) => {
      // login is shown by default on load
    }
  },
  { name: 'dashboard',         fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('dashboard'); }); } },
  { name: 'pipeline',          fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('pipeline'); }); } },
  { name: 'clients',           fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('clients'); }); } },
  { name: 'client-detail',     fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('client-detail'); }); } },
  { name: 'jobs',              fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('jobs'); }); } },
  { name: 'job-detail',        fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('job-detail'); }); } },
  { name: 'candidates',        fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('candidates'); }); } },
  { name: 'candidate-profile', fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('candidate-profile'); }); } },
  { name: 'upload-cv',         fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('upload-cv'); }); } },
  { name: 'cv-review',         fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('cv-review'); }); } },
  { name: 'cv-template',       fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('cv-template'); }); } },
  { name: 'cv-download',       fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('cv-download'); }); } },
  { name: 'activity',          fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('activity'); }); } },
  { name: 'reminders',         fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('reminders'); }); } },
  { name: 'files-root',        fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('files'); showFWRoot(); }); } },
  { name: 'files-entity',      fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('files'); showFWEntity(); }); } },
  { name: 'files-folder',      fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('files'); showFWFolder(); }); } },
  { name: 'onboarding',        fn: async (page) => { await page.evaluate(() => { showApp(); showScreen('onboarding'); }); } },
];

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });

  for (const screen of SCREENS) {
    await page.goto(BASE, { waitUntil: 'networkidle0' });
    await screen.fn(page);
    await new Promise(r => setTimeout(r, 300));
    const file = path.join(OUT, `${screen.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`✓ ${screen.name}`);
  }

  await browser.close();
  console.log('All screenshots saved to', OUT);
})();
