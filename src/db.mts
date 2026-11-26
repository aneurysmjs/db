import { Pool } from 'pg';

const DEFAULT_DATABASE_URL =
  'postgres://postgres:postgres@localhost:5432/intro';

// Defaults match docker-compose.yml; override with DATABASE_URL if needed.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
});
