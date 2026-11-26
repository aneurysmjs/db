# db

Playground for talking to PostgreSQL from TypeScript with the raw `pg` driver.

## Setup

```bash
docker compose up -d      # Postgres on localhost:5432, pgAdmin on localhost:5050
pnpm install
cp .env.example .env
pnpm dev                  # runs src/index.ts and re-runs on save
```

## Environment variables

Configuration lives in a `.env` file at the project root. It is git-ignored, so each machine keeps its own copy; `.env.example` is the committed template listing every variable the code reads.

| Variable       | Read by        | Value in `.env.example`                             |
| -------------- | -------------- | --------------------------------------------------- |
| `DATABASE_URL` | `src/index.ts` | `postgres://postgres:postgres@localhost:5432/intro` |

How it behaves:

- **Loading.** `pnpm dev` and `pnpm start` pass `--env-file-if-exists=.env` to Node, which loads the file before the script runs. There is no `dotenv` dependency and nothing to import.
- **No `.env`.** The scripts still run: `src/index.ts` falls back to the same connection string shown above.
- **Precedence.** A variable already set in your shell wins over `.env`, which is handy for a one-off run against another database:

  ```bash
  DATABASE_URL=postgres://user:pass@host:5432/other pnpm start
  ```

- **Docker.** `docker-compose.yml` does not read `.env`; the container's user, password, database and port are set directly in that file. If you change them there, update `DATABASE_URL` to match.

When you add a new variable, add it to `.env.example` too (with a safe placeholder, never a real secret) and to the table above.
