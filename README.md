# NIO Internal API

[![CI](https://github.com/ndustrialio/nio-internal-api/workflows/CI/badge.svg)](https://github.com/ndustrialio/nio-internal-api/actions?query=workflow%3ACI)


## Merge Strategy

When merging from `staging` to `main`, the preference is to merge via Fast
Forward strategy (`--ff-only`). This can be achieved by specifying a comment
`/fast-forward` on the promotion PR. If you are unable to merge due to a
previous merge commit, you may have to:

```bash
git checkout main && git pull
git checkout staging && git pull
git merge main
git push origin staging
```

## Local Setup

**Requires**: [nvm](https://github.com/nvm-sh/nvm#readme) and
[Docker Desktop](https://www.docker.com/products/docker-desktop)

```sh
nvm use
npm install
npm start
```

By default, the following services will be available:

- GraphQL server at <http://localhost:3000/graphql>
- Postgres at <postgres://user:pass@localhost:5433/db>

## Tests

N/A

## Migrations

Database migrations are handled via
[Graphile Migrate](https://github.com/graphile/migrate). They're stored as plain
SQL files [here](src/db/migrations/committed/) and automatically run on startup.

- To add a new migration, write SQL to the
  [current migration](src/db/migrations/current.sql) and commit:

  ```sh
  npx graphile-migrate commit
  ```

  To run the
  [unit and metric metadata](src/db/migrations/hooks/untsAndMetricMetadata.sql)
  seed files

  ```sh
    # To clean out existing values and completely re-flow unit group dimensions and metadata, uncomment this env vars
    npx graphile-migrate migrate --forceActions
  ```

- To reset your local database to a clean state:

  ```sh
  npx graphile-migrate reset --erase # highly destructive
  ```
