# GitHub Workflows

This directory contains GitHub Actions workflows for continuous integration and quality assurance.

## 🔄 Workflows Overview

### 1. `ci.yml` - Main CI Pipeline

**Triggers:** Push/PR to `main` or `develop` branches

**Jobs:**

- **`main-checks`**: Core quality gates (format, lint, type check, build)
- **`security-check`**: Security audit and dependency analysis
- **`openapi-validation`**: API documentation validation

### 2. `quality-checks.yml` - Advanced Analysis

**Triggers:** Push to `main`, PRs to `main`, weekly schedule

**Jobs:**

- **`code-analysis`**: Code metrics, TypeScript config, documentation coverage
- **`dependency-analysis`**: Dependency metrics and bundle size analysis
- **`workspace-health`**: Workspace validation and Git hooks simulation

## 🔧 Reusable Action

### `setup-project` Composite Action

Located in `.github/actions/setup-project/`, this reusable action handles:

- pnpm setup (v10.6.3)
- Node.js setup (default: 20.x)
- Dependency installation
- Prisma client generation
- Environment setup

**Usage:**

```yaml
- name: Setup Project
  uses: ./.github/actions/setup-project
  with:
    node-version: '20.x' # optional, defaults to 20.x
    skip-prisma: 'false' # optional, set to 'true' to skip Prisma
```

## 🚀 Quick Start

### Running Locally

```bash
# Main quality checks
pnpm run format:check
pnpm run lint
pnpm run check-ts
pnpm run build

# Security checks
pnpm audit --audit-level moderate
pnpm outdated
```

### Pre-commit Setup

```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
pnpm run format:check && pnpm run lint && pnpm run check-ts
EOF
chmod +x .git/hooks/pre-commit
```

## 📊 Benefits of Simplified Structure

### ✅ Improvements Made

1. **Reduced Duplication**: Common setup extracted to reusable action
2. **Faster CI**: Combined related checks into single jobs
3. **Clearer Purpose**: Each workflow has distinct responsibilities
4. **Easier Maintenance**: Changes to setup process only needed in one place
5. **Better Performance**: Fewer job initializations and setup overhead

### 📈 Metrics

- **Lines Reduced**: ~500 lines → ~150 lines (70% reduction)
- **Jobs Consolidated**: 8 jobs → 6 jobs
- **Setup Duplication**: 8x → 1x (reusable action)
- **Maintenance Points**: Multiple files → Single action file

## 🔧 Configuration

- **Node.js Version**: 20.x LTS (configurable via action input)
- **pnpm Version**: 10.6.3 (as specified in package.json)
- **Cache Strategy**: Node modules cached automatically

## 🐛 Troubleshooting

### Common Issues

1. **Format check fails**: `pnpm run format`
2. **Lint errors**: `pnpm run lint:fix`
3. **Type errors**: Fix TypeScript errors manually
4. **Build failures**: Ensure dependencies are installed

### Local Testing

Test the same checks locally before pushing:

```bash
# Quick validation
pnpm run format:check && pnpm run lint && pnpm run check-ts && pnpm run build
```

## 📝 Adding New Checks

1. **Core checks**: Add to `ci.yml` main-checks job
2. **Analysis checks**: Add to `quality-checks.yml`
3. **Setup changes**: Modify `.github/actions/setup-project/action.yml`
4. **Test locally first**: Always verify changes work locally
