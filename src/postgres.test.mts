import type { PoolClient } from 'pg';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { pool } from './db.mts';

afterAll(async () => {
  await pool.end();
});

// Each test runs on its own connection inside a transaction that is rolled
// back afterwards, so rows inserted by one test never leak into the next.
let client: PoolClient;

beforeEach(async () => {
  client = await pool.connect();
  await client.query('BEGIN');
});

afterEach(async () => {
  await client.query('ROLLBACK');
  client.release();
});

describe('postgres', () => {
  it('runs against the test database, not the dev one', async () => {
    const { rows } = await client.query<{ name: string }>(
      'SELECT current_database() AS name',
    );

    expect(rows[0]?.name).toMatch(/_test$/);
  });

  it('binds query parameters', async () => {
    const { rows } = await client.query<{ total: number }>(
      'SELECT $1::int + $2::int AS total',
      [2, 3],
    );

    expect(rows[0]?.total).toBe(5);
  });

  it('starts with an empty people table', async () => {
    await client.query(
      'INSERT INTO people (id, first_name, last_name, employed, age) VALUES ($1, $2, $3, $4, $5)',
      [1, 'Ada', 'Lovelace', true, 36],
    );

    const { rows } = await client.query<{ first_name: string; age: number }>(
      'SELECT first_name, age FROM people',
    );

    expect(rows).toEqual([{ first_name: 'Ada', age: 36 }]);
  });
});
