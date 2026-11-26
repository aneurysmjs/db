import { pool } from './db.mts';

const { rows } = await pool.query<{ version: string; now: Date }>(
  'SELECT version(), now()',
);
console.log('result', rows[0]);

const sum = await pool.query<{ total: number }>(
  'SELECT $1::int + $2::int as total',
  [2, 3],
);

/// console.log(sum.rows[0]?.total);
const result = await pool.query<{ version: string; now: Date }>(
  'SELECT * FROM people',
);

console.log(result.rows);

await pool.end();
