# db

Playground for talking to PostgreSQL from TypeScript with the raw `pg` driver.

## Setup

```bash
docker compose up -d      # Postgres on localhost:5432, pgAdmin on localhost:5050
pnpm install
cp .env.example .env
pnpm dev                  # runs src/main.mts and re-runs on save
pnpm test                 # runs the tests once (needs the database up)
pnpm test:watch           # re-runs the tests on save
```

## Environment variables

Configuration lives in a `.env` file at the project root. It is git-ignored, so each machine keeps its own copy; `.env.example` is the committed template listing every variable the code reads.

| Variable            | Read by                      | Value in `.env.example`                                  |
| ------------------- | ---------------------------- | -------------------------------------------------------- |
| `DATABASE_URL`      | `src/db.mts`, `src/main.mts` | `postgres://postgres:postgres@localhost:5432/intro`      |
| `TEST_DATABASE_URL` | `vitest.config.mts`          | `postgres://postgres:postgres@localhost:5432/intro_test` |

How it behaves:

- **Loading.** `pnpm dev` and `pnpm start` pass `--env-file-if-exists=.env` to Node, which loads the file before the script runs; `vitest.config.mts` does the same for the tests. There is no `dotenv` dependency and nothing to import.
- **No `.env`.** Everything still runs: the code and the tests fall back to the values shown above.
- **Precedence.** A variable already set in your shell wins over `.env`, which is handy for a one-off run against another database:

  ```bash
  DATABASE_URL=postgres://user:pass@host:5432/other pnpm start
  ```

- **Docker.** `docker-compose.yml` does not read `.env`; the container's user, password, database and port are set directly in that file. If you change them there, update `DATABASE_URL` to match.

When you add a new variable, add it to `.env.example` too (with a safe placeholder, never a real secret) and to the table above.

## Tests

`pnpm test` never touches the dev database. It uses a separate database, `intro_test`, in the same container:

1. Before the run, `src/test/global-setup.mts` drops `intro_test`, creates it again and applies `sql/schema.sql`, so every run starts with empty tables.
2. During the run, `DATABASE_URL` points at `intro_test`, so code that uses the pool from `src/db.mts` hits the test database without any changes.
3. Each test runs inside a transaction that is rolled back afterwards, so rows from one test never reach the next. This also keeps `pnpm test:watch` clean, since the setup only runs when watch mode starts.

Because the database is dropped on every run, the setup refuses to run unless its name ends in `_test`.

When you add or change a table in `intro`, make the same change in `sql/schema.sql`, or the tests won't see it.
