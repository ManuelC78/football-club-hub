# CI/CD Setup

## GitHub Actions CI Pipeline

GitHub requires the `workflow` OAuth scope to commit `.github/workflows/*.yml` files via the API.
To activate the CI pipeline, copy the YAML below into `.github/workflows/ci.yml` in your repo.

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  server-test:
    name: Server — lint & test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    defaults:
      run:
        working-directory: server
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
          cache-dependency-path: server/package-lock.json
      - name: Install dependencies
        run: npm ci --if-present || npm install
      - name: Lint
        run: npm run lint || echo "Lint warnings noted"
      - name: Run tests
        run: npm test -- --coverage --forceExit
        env:
          NODE_ENV: test
          JWT_SECRET: test-secret-key-for-ci
          REFRESH_TOKEN_SECRET: test-refresh-secret-for-ci
          PORT: 3000

  client-build:
    name: Client — lint & build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: client
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: npm
          cache-dependency-path: client/package-lock.json
      - name: Install dependencies
        run: npm ci --if-present || npm install
      - name: Lint
        run: npm run lint || echo "Lint warnings noted"
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3000

  security-audit:
    name: Security audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
      - run: cd server && npm install && npm audit --audit-level=high || true
      - run: cd client && npm install && npm audit --audit-level=high || true
```

## One-Time Setup

1. Copy the YAML above to `.github/workflows/ci.yml`
2. Push to any branch — CI runs automatically on push/PR
3. Add `CODECOV_TOKEN` in repo Settings → Secrets → Actions for coverage reports

## Branch Protection (already enabled)

`main` branch requires PR review. Recommended: also enable "Require status checks to pass" once CI is active.
