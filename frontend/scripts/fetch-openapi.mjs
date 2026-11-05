#!/usr/bin/env node
/**
 * Refresh checked-in OpenAPI contracts from running Spring services (springdoc).
 * Usage: node scripts/fetch-openapi.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SERVICES = [
  {
    name: 'orders',
    env: 'ORDERS_OPENAPI_URL',
    out: join(ROOT, 'packages/orders/openapi.json'),
  },
  {
    name: 'payment',
    env: 'PAYMENT_OPENAPI_URL',
    out: join(ROOT, 'packages/payment/openapi.json'),
  },
  {
    name: 'notification',
    env: 'NOTIFICATION_OPENAPI_URL',
    out: join(ROOT, 'packages/notification/openapi.json'),
  },
  {
    name: 'inventory',
    env: 'INVENTORY_OPENAPI_URL',
    out: join(ROOT, 'packages/inventory/openapi.json'),
  },
];

function loadEnvFile(path) {
  if (!existsSync(path)) return false;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return true;
}

function loadEnv() {
  if (loadEnvFile(join(ROOT, '.env'))) return;
  if (loadEnvFile(join(ROOT, '.env.example'))) {
    console.warn('No .env found — using .env.example (copy it to .env to customize)');
    return;
  }
  throw new Error('Missing .env and .env.example — see frontend/.env.example');
}

async function fetchSpec({ name, env, out }) {
  const url = process.env[env];
  if (!url) {
    throw new Error(`Set ${env} in .env (see .env.example)`);
  }

  console.log(`Fetching ${name} from ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  const spec = await response.json();
  writeFileSync(out, `${JSON.stringify(spec, null, 2)}\n`);
  console.log(`  -> ${out}`);
}

loadEnv();

try {
  for (const service of SERVICES) {
    await fetchSpec(service);
  }
  console.log('Done. Run: npm run generate:api (or npm run sync:api)');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
