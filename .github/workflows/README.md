# GitHub Workflows

This directory contains GitHub Actions workflows for continuous integration and quality assurance.

## 🔄 Workflows Overview

### 1. `ci.yml` - Main CI Pipeline

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### `lint-and-typecheck`

- **Purpose**: Core code quality checks
- **Node versions**: 20.x, 22.x (matrix strategy)
- **Steps**:
  - ✅ Format checking with Prettier
  - 📝 ESLint for both frontend and backend
  - 🔧 TypeScript type checking
  - 🏗️ Build verification
  - 📊 Artifact upload on failure

#### `lint-specific`

- **Purpose**: Detailed lint analysis for PRs
- **Triggers**: Only on pull requests
- **Features**:
  - Detailed ESLint reports with Unix format
  - Prettier diff reporting
  - Grouped output for better readability

#### `security-check`

- **Purpose**: Security and dependency validation
- **Features**:
  - 🔒 Security audit with `pnpm audit`
  - 📦 Outdated dependency detection
  - 🔍 Dependency analysis

#### `workspace-validation`

- **Purpose**: Monorepo and workspace validation
- **Features**:
  - 🔍 Workspace configuration validation
  - 📝 Script inventory across packages
  - 🏗️ Full build process verification

#### `openapi-validation`

- **Purpose**: API documentation validation
- **Features**:
  - 🔍 OpenAPI spec validation
  - 📊 OpenAPI bundling
  - 📤 Artifact upload for bundled spec

### 2. `quality-checks.yml` - Advanced Quality Analysis

**Triggers:**

- Push to `main` branch
- Pull requests to `main` branch
- Weekly schedule (Sundays at 2 AM UTC)

**Jobs:**

#### `advanced-linting`

- **Purpose**: Deep code quality analysis
- **Features**:
  - 🔍 TypeScript strict mode compliance
  - 📊 Code complexity metrics
  - 🔧 Import/export analysis
  - 📝 Documentation coverage assessment

#### `performance-analysis`

- **Purpose**: Bundle and performance metrics
- **Features**:
  - 📦 Bundle size analysis
  - 🔍 Dependency size tracking
  - Build output analysis

#### `git-hooks-simulation`

- **Purpose**: Simulate Git hooks in CI
- **Features**:
  - 🔄 Pre-commit hook simulation
  - 🚀 Pre-push hook simulation
  - Complete quality gate testing

#### `workspace-health`

- **Purpose**: Workspace integrity checks
- **Features**:
  - 🔍 Workspace configuration validation
  - 📦 Package.json validation
  - 🔧 Script consistency verification

## 🚀 Quick Start

### Running Locally

To run the same checks locally before pushing:

```bash
# Format check
pnpm run format:check

# Lint everything
pnpm run lint

# Type check everything
pnpm run check-ts

# Build everything
pnpm run build
```

### Pre-commit Setup

For the best development experience, consider setting up pre-commit hooks:

```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
echo "Running pre-commit checks..."

# Format check
pnpm run format:check || {
  echo "❌ Format check failed. Run 'pnpm run format' to fix."
  exit 1
}

# Lint
pnpm run lint || {
  echo "❌ Lint check failed. Run 'pnpm run lint:fix' to fix."
  exit 1
}

# Type check
pnpm run check-ts || {
  echo "❌ Type check failed. Fix TypeScript errors."
  exit 1
}

echo "✅ All pre-commit checks passed!"
EOF

chmod +x .git/hooks/pre-commit
```
