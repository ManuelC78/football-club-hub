# Contributing to Football Club Hub

Thank you for your interest in contributing! Here's how to get involved.

## Development Workflow

1. **Fork** the repository
2. **Clone** your fork locally
3. Create a **feature branch** from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/your-feature-name
   ```
4. Make your changes following our coding standards
5. Write or update **tests** for your changes
6. Run the test suite: `npm test`
7. **Commit** using conventional commits: `git commit -m "feat: your feature"`
8. **Push** your branch and open a **Pull Request** against `develop`

## Code Standards

- ESLint + Prettier for formatting (`npm run lint`)
- Jest for testing (`npm test`)
- 80%+ test coverage expected for new features
- JSDoc comments for all exported functions

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Include a clear description of what changed and why
- Reference any related issues: `Closes #123`
- All CI checks must pass before merging

## Reporting Bugs

Open an issue using the **Bug Report** template. Include:
- Steps to reproduce
- Expected vs actual behaviour
- Your environment (OS, Node version, browser)

## Suggesting Features

Open an issue using the **Feature Request** template.
