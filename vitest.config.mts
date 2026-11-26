import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Load .env like `pnpm dev` does: optional, and shell variables take precedence.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgres://postgres:postgres@localhost:5432/intro_test';

export default defineConfig({
  test: {
    // Code under test reads DATABASE_URL, so point it at the test database.
    env: { DATABASE_URL: testDatabaseUrl },
    // Recreates the test database from sql/schema.sql before each run.
    globalSetup: ['config/vitest/global-setup.mts'],
  },
});
