# Nionic API

[![CI](https://github.com/ndustrialio/nionic-api/workflows/CI/badge.svg)](https://github.com/ndustrialio/nionic-api/actions?query=workflow%3ACI)

## Documentation

- [Internal](https://ndustrial.api.ndustrial.io/internal/docs)
- [Public](https://ndustrial.api.ndustrial.io/docs)

Core GraphQL API exposing customer-specific relational and time-series data

## Directories

- `.github`: CI/CD configuration via GitHub Actions
- `__tests__`: Unit and integration tests
- [`charts`](charts/README.md): Deployment configuration via Helm
- `docker`: Docker configuration
- `docs`: Documentation
- [`scripts`](scripts/README.md): Utility scripts
- `schemas`: Generated schemas
- `src`: Source code

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
./scripts/bootstrap.sh
nvm use
npm install
npm start
```

By default, the following services will be available:

- GraphQL server at <http://localhost:3000/graphql>
- Postgres at <postgres://user:pass@localhost:5432/db>

> Tip: To deploy to a local Kubernetes cluster, replace `npm start` with
> `npm run start:k8s`

## Tests

Tests are run via [Jest](https://jestjs.io/docs/getting-started):

```sh
npm run test
npm run test -- --watch # watch mode
```

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

## Environments

Each tenant has its own instance. We use [Datadog](https://app.datadoghq.com/)
to monitor our environments.

The **Service Account** used to access AWS components (S3) is driven via a
manually created service account CRD based on the CRDs in the `charts/`
directory.

- Production:
  [Datadog](https://app.datadoghq.com/apm/service/nionic-api/express.request?env=prod)
  - Internal: <https://ndustrial.api.ndustrial.io>
  - Lineage: <https://lineage.api.ndustrial.io>
- Staging:
  [Datadog](https://app.datadoghq.com/apm/service/nionic-api/express.request?env=staging)
  - Internal: <https://ndustrial.api.staging.ndustrial.io>
  - Lineage: <https://lineage.api.staging.ndustrial.io>

## Documentation

nionic uses [mkdocs](https://www.mkdocs.org/) to generate themed docs from
markdown. There are two _sites_ that we create -
[docs/external](./docs/external) and [docs/internal](./docs/internal). These
sites are separated as follows:

- **external**: Public/customer-facing documentation on how to use the API
- **internal**: ndustrial developer docs (including design decisions, runbooks,
  etc.)

There is a helper bash script [`./scripts/mkdocs.sh`](./scripts/mkdocs.sh) that
can be used to serve/build docs while developing. This script is aliased to the
`npm run mkdocs` command. By default, this script will use a docker container to
run `mkdocs` but you can pass additional flags to use
[pipx](https://github.com/pypa/pipx) or standard
[pip](https://pip.pypa.io/en/stable/).

For more information, run:

```sh
./scripts/mkdocs.sh --help
```

### Serve docs locally with hot-reload

```sh
npm run mkdocs:serve
```

The above command will expose the external site at http://localhost:8000 and the
internal site at http://localhost:80001.

### Build docs locally to the `./site` directory

```sh
npm run mkdocs
```

Once the `site` folder is generated, the standard `npm run start` command will
expose the documentation at https://localhost:3000/docs and
https://localhost:3000/internal/docs.
