import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const skillDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(skillDir, '../../../..')
const src = path.join(repoRoot, 'frontend/src')

const IGNORE = new Set(['node_modules', 'dist'])
const CODE = new Set(['.js', '.jsx', '.ts', '.tsx'])

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name) || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (CODE.has(path.extname(entry.name))) files.push(full)
  }
  return files
}

function rel(file) {
  return path.relative(src, file).replaceAll('\\', '/')
}

const files = walk(src)
const byName = new Map()
const deepImports = []
const oversized = []
const misplacedTelegram = []

for (const file of files) {
  const name = path.basename(file)
  const list = byName.get(name) || []
  list.push(rel(file))
  byName.set(name, list)

  const text = fs.readFileSync(file, 'utf8')
  const lines = text.split('\n').length
  if (lines > 350) oversized.push({ file: rel(file), lines })

  const importRe = /from\s+['"](\.\.\/[^'"]+)['"]/g
  let match
  while ((match = importRe.exec(text))) {
    const ups = match[1].match(/\.\.\//g)?.length || 0
    if (ups >= 3) deepImports.push({ file: rel(file), import: match[1] })
  }

  if (text.includes('components/dashboard/TelegramIcon')) {
    misplacedTelegram.push(rel(file))
  }
}

function isApiDataPair(paths) {
  if (paths.length !== 2) return false
  const sorted = [...paths].sort()
  return sorted[0].startsWith('api/') && sorted[1].startsWith('data/')
}

const duplicateNames = [...byName.entries()]
  .filter(([, paths]) => paths.length > 1)
  .filter(([name]) => name !== 'index.js' && name !== 'index.jsx')
  .filter(([, paths]) => !isApiDataPair(paths))

console.log('PRS structure check')
console.log('===================')
console.log(`Files: ${files.length}`)

console.log('\nDuplicate filenames (hard to look up):')
if (!duplicateNames.length) console.log('  none')
else {
  for (const [name, paths] of duplicateNames) {
    console.log(`  ${name}`)
    for (const p of paths) console.log(`    - ${p}`)
  }
}

console.log('\nDeep relative imports (../../../):')
if (!deepImports.length) console.log('  none')
else for (const row of deepImports) console.log(`  ${row.file} -> ${row.import}`)

console.log('\nFiles over 350 lines:')
if (!oversized.length) console.log('  none')
else for (const row of oversized) console.log(`  ${row.file} (${row.lines})`)

console.log('\nTelegramIcon still imported from dashboard/:')
if (!misplacedTelegram.length) console.log('  none')
else for (const file of misplacedTelegram) console.log(`  ${file}`)
