import puppeteer from 'puppeteer'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const htmlPath = resolve('C:/Users/Gwt/AppData/Local/Temp/claude/e--Working-AI-Bootcamp-RecruitSync-project/75df7255-74ef-44de-9f79-77ad46968b6d/scratchpad/assignment-report.html')
const outPath  = resolve('E:/Working/AI Bootcamp/RecruitSync_project/RecruitSync_Assignment_Report.pdf')

const html = readFileSync(htmlPath, 'utf8')

const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
})
const page    = await browser.newPage()

await page.setContent(html, { waitUntil: 'networkidle0' })

await page.evaluate(() => {
  document.documentElement.setAttribute('data-theme', 'light')
})

await page.pdf({
  path: outPath,
  format: 'A4',
  margin: { top: '20mm', right: '18mm', bottom: '20mm', left: '18mm' },
  printBackground: true,
})

await browser.close()
console.log('PDF saved:', outPath)
