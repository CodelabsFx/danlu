const fs = require('fs')
const path = require('path')
const db = require('../src/db')

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

async function run() {
  const migrationPath = path.resolve(__dirname, '../../migrations/002_add_product_image.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')
  console.log('Applying migration:', migrationPath)

  const maxAttempts = 20
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await db.pool.query(sql)
      console.log('Migration 002 applied successfully')
      process.exit(0)
    } catch (err) {
      const msg = err && err.message ? err.message : String(err)
      console.warn(`Attempt ${attempt}/${maxAttempts} failed: ${msg}`)
      if (attempt === maxAttempts) {
        console.error('Migration failed after retries:', msg)
        process.exit(1)
      }
      await sleep(2000)
    }
  }
}

run()
