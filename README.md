# BibleBowl

A structured content management system for Bible study material, with built-in validation and continuous integration.

## Quick Start

### Prerequisites
- Node.js 20+ ([Download](https://nodejs.org/))
- Git

### Local Setup

```bash
# Clone the repository
git clone <repository-url>
cd codespaces-blank

# Install dependencies
npm ci

# Verify everything works
npm run lint
npm test
```

## Development Workflow

### Making Changes Safely

To avoid breaking the CI/CD pipeline, follow this workflow:

#### 1. **Create a Feature Branch**
Always work on a dedicated branch, never directly on `main`:

```bash
git checkout -b feature/your-feature-name
# or: git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/description` - new functionality
- `fix/description` - bug fixes
- `docs/description` - documentation updates

#### 2. **Make Your Changes**

Run the lint and test checks **before** committing:

```bash
# Check for linting errors
npm run lint

# Run smoke tests
npm test
```

Fix any issues before proceeding.

#### 3. **Commit and Push**

```bash
# Commit your changes
git add <files>
git commit -m "Concise description of changes"

# Push to remote
git push origin feature/your-feature-name
```

#### 4. **Create a Pull Request**

- Go to GitHub and create a PR from your branch to `main`
- The CI/CD pipeline will automatically run linting and tests
- **Wait for CI checks to pass** before merging
- Request a code review if applicable
- Merge only when all checks pass ✅

### Common Workflows

#### Updating `docs/verses.txt`
```bash
# Make changes to the verses file
nano docs/verses.txt

# Verify the format is valid
npm test

# If the test passes, your changes are good to commit
git add docs/verses.txt
git commit -m "Add new verse segments"
```

#### Modifying `docs/app.js` or other JavaScript files
```bash
# Make your code changes
nano docs/app.js

# Check for linting errors
npm run lint

# Fix any issues, then test
npm test

# Commit only after both checks pass
git add docs/app.js
git commit -m "Update app functionality"
```

## CI/CD Pipeline

The project uses **GitHub Actions** to automatically test every change:

### What Runs on Every Pull Request and Push to `main`

1. **Node Setup** - Sets up Node.js 20 environment
2. **Dependencies** - Runs `npm ci` (clean install)
3. **Linting** - Runs `npm run lint` using ESLint
4. **Smoke Tests** - Runs `npm test` to validate data integrity

### Understanding Test Failures

If a CI check fails:

1. **Linting Errors** - You have JavaScript syntax or style issues
   - Run `npm run lint` locally to see the exact errors
   - Fix them in your code editor
   - Commit the fixes

2. **Smoke Test Failures** - The `verses.txt` file format is invalid
   - Run `npm test` locally to see which segment has issues
   - Ensure each SEGMENT has:
     - Line 1: `SEGMENT <number>`
     - Line 2: Scripture reference (e.g., `Jonah 1:12-14`)
     - Line 3+: Content lines
   - Fix the format and commit

### How to Avoid CI/CD Failures

✅ **DO:**
- Run `npm run lint` and `npm test` before pushing
- Fix all errors locally first
- Review your changes carefully
- Commit frequently with clear messages
- Keep commits focused on one feature/fix

❌ **DON'T:**
- Push to `main` directly (use branches!)
- Force-push to main or shared branches
- Skip running checks before pushing
- Make unrelated changes in one commit
- Merge without waiting for CI to pass

## Project Structure

```
.
├── docs/              # Deployment content (HTML, CSS, JS)
│   ├── app.js         # Main application logic
│   ├── index.html     # Entry point
│   ├── styles.css     # Styles
│   └── verses.txt     # Verse data (validated by tests)
├── scripts/           # Build/test scripts
│   └── smoke-test.js  # Data validation tests
├── workflows/         # CI/CD configuration
│   └── ci.yml         # GitHub Actions workflow
├── eslint.config.js   # Linting rules
└── package.json       # Project metadata & scripts
```

## Available Commands

```bash
# Run linting checks
npm run lint

# Run tests
npm test

# Run both linting and tests
npm run lint && npm test
```

## Troubleshooting

### "Permission denied" when running npm?
```bash
# Ensure you have the right permissions
npm ci --no-audit
```

### Tests pass locally but fail in CI?
- Ensure you're using Node 20: `node --version`
- Ensure files have Unix line endings (not Windows CRLF)
- Verify all files are committed: `git status`

### How do I see CI logs?
Go to your PR on GitHub → **Checks** tab → Click the failed check to see detailed logs

## Getting Help

1. Check the [GitHub Issues](issues) for related problems
2. Review the CI logs in the GitHub Actions tab
3. Ensure your local environment matches the CI setup (Node 20, npm 10+)

## Contributing

This project uses automated checks to maintain code quality. Every PR must:
- ✅ Pass ESLint linting
- ✅ Pass smoke tests
- ✅ Have clear, descriptive commits

Please review this README before your first contribution!
