// Prepares the throwaway Postgres database used by the API test suite.
// Never touches the development database: everything below runs against the
// local docker compose Postgres (port 5433), database prs_test.
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const backendDir = path.join(repoRoot, 'backend')
const TEST_DB_URL = 'postgresql://prs:prs@localhost:5433/prs_test'

function docker(...args) {
  return execFileSync('docker', args, { cwd: repoRoot, encoding: 'utf8' })
}

docker('compose', 'up', '-d', 'db')

const exists = docker(
  'compose', 'exec', '-T', 'db', 'psql', '-U', 'prs', '-tAc',
  "SELECT 1 FROM pg_database WHERE datname='prs_test'",
).trim()
if (exists !== '1') {
  docker('compose', 'exec', '-T', 'db', 'psql', '-U', 'prs', '-c', 'CREATE DATABASE prs_test')
  console.log('Created database prs_test')
}

execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, DATABASE_URL: TEST_DB_URL, DIRECT_URL: TEST_DB_URL },
})

console.log('Test database ready at localhost:5433/prs_test')
