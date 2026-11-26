import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Client, escapeIdentifier } from 'pg';
import type { TestProject } from 'vitest/node';

// Runs once before all test files: drops and recreates the test database, then
// applies sql/schema.sql, so every run starts from empty tables.
export default async function setup(project: TestProject): Promise<void> {
  const testUrl = project.config.env.DATABASE_URL;

  if (!testUrl) {
    throw new Error(
      'DATABASE_URL is not set for tests (see vitest.config.mts)',
    );
  }

  const url = new URL(testUrl);
  const name = decodeURIComponent(url.pathname.slice(1));

  // This database gets dropped, so never let it point at real data.
  if (!name.endsWith('_test')) {
    throw new Error(
      `Refusing to reset database "${name}": test database names must end in "_test".`,
    );
  }

  // CREATE/DROP DATABASE must run from a connection to another database.
  const adminUrl = new URL(url);

  adminUrl.pathname = '/postgres';

  const admin = new Client({ connectionString: adminUrl.href });

  await admin.connect();

  try {
    await admin.query(
      `DROP DATABASE IF EXISTS ${escapeIdentifier(name)} WITH (FORCE)`,
    );
    await admin.query(`CREATE DATABASE ${escapeIdentifier(name)}`);
  } finally {
    await admin.end();
  }

  const schema = await readFile(
    join(project.config.root, 'sql/schema.sql'),
    'utf8',
  );
  const db = new Client({ connectionString: url.href });
  await db.connect();
  try {
    await db.query(schema);
  } finally {
    await db.end();
  }
}
