import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'

const OUT = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop', 'maderapro-screenshots')
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()

// ── POSTER — single image for FB / LinkedIn post ──
await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000/poster', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 1000))
await page.evaluate(() => {
  const el = document.querySelector('nextjs-portal')
  if (el) el.remove()
})
await page.screenshot({
  path: path.join(OUT, 'poster-fb-linkedin.png'),
  clip: { x: 0, y: 0, width: 1200, height: 1200 }
})
console.log('✓ poster-fb-linkedin.png  (1200×1200 — ready to post)')

await browser.close()
console.log(`\nDone! Saved to:\n${OUT}`)
