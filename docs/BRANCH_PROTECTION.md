# Branch Protection Rules

This document outlines the branch protection rules and workflow requirements for the scaffold-scripts repository.

## Branch Structure

### Main Branches

- **main**: Production-ready code, protected
- **develop**: Development integration branch, protected  
- **release**: Release preparation branch, protected

### Feature Branches

- **feature/**: New feature development
- **bugfix/**: Bug fixes
- **hotfix/**: Critical production fixes

## Branch Protection Rules

### Main Branch Protection

**Required settings for `main` branch:**

- [x] Require pull request reviews before merging
  - Required number of reviewers: 1
  - Dismiss stale reviews when new commits are pushed
  - Require review from code owners (if CODEOWNERS file exists)
- [x] Require status checks to pass before merging
  - Require branches to be up to date before merging
  - **Required status checks:**
    - `Test Suite` (CI workflow)
    - `Integration Tests` (CI workflow)
    - `End-to-End Tests` (CI workflow)
    - `Security Audit` (CI workflow)
- [x] Require conversation resolution before merging
- [x] Require signed commits
- [x] Restrict pushes that create files larger than 100MB
- [x] Do not allow force pushes
- [x] Do not allow deletions

### Develop Branch Protection

**Required settings for `develop` branch:**

- [x] Require pull request reviews before merging
  - Required number of reviewers: 1
- [x] Require status checks to pass before merging
  - **Required status checks:**
    - `Test Suite` (CI workflow)
    - `Integration Tests` (CI workflow)
- [x] Require conversation resolution before merging
- [x] Do not allow force pushes
- [x] Do not allow deletions

### Release Branch Protection

**Required settings for `release` branch:**

- [x] Require pull request reviews before merging
  - Required number of reviewers: 2
  - Require review from code owners
- [x] Require status checks to pass before merging
  - Require branches to be up to date before merging
  - **Required status checks:**
    - `Validate Release` (Release workflow)
    - `Test Suite` (CI workflow)
    - `Integration Tests` (CI workflow)
    - `End-to-End Tests` (CI workflow)
    - `Security Audit` (CI workflow)
- [x] Require conversation resolution before merging
- [x] Require signed commits
- [x] Do not allow force pushes
- [x] Do not allow deletions

## Workflow Requirements

### Feature Development

1. **Create feature branch** from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Develop and test** your feature
   ```bash
   npm run build
   npm run lint
   npm run test:unit
   npm run test:integration
   ```

3. **Create pull request** to `develop`
   - Fill out PR template completely
   - Ensure all CI checks pass
   - Request review from team members

### Release Process

1. **Create release branch** from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release-v1.x.x
   ```

2. **Prepare release**
   - Update version numbers
   - Update documentation
   - Run full test suite
   ```bash
   npm run precommit
   npm run test:integration
   npm run test:e2e
   ```

3. **Create PR to release branch**
   - Use release PR template
   - Require 2 reviewers
   - All status checks must pass

4. **Deploy from release branch**
   - Automatic NPM publishing
   - GitHub release creation
   - Tag creation

### Hotfix Process

1. **Create hotfix branch** from `main`
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix-v1.x.y
   ```

2. **Fix critical issue**
   - Minimal changes only
   - Thorough testing required

3. **Create PRs to both `main` and `develop`**
   - Emergency review process
   - Fast-track CI checks

## Status Checks Configuration

### Required CI Workflows

All protected branches require these status checks to pass:

#### Test Suite (`ci.yml`)
- **Node.js matrix**: 16.x, 18.x, 20.x
- **TypeScript compilation**: `npm run build`
- **Linting**: `npm run lint`
- **Unit tests**: `npm run test:ci`
- **Coverage**: Unit test coverage report

#### Integration Tests (`ci.yml`)
- **Component interaction testing**: `npm run test:integration`
- **System integration validation**

#### End-to-End Tests (`ci.yml`)
- **Cross-platform testing**: Ubuntu, Windows, macOS
- **Complete workflow validation**: `npm run test:e2e`

#### Security Audit (`security.yml`)
- **Dependency scanning**: `npm audit`
- **CodeQL analysis**: Static security analysis
- **License compliance**: License checker
- **Secret scanning**: TruffleHog scan

### CI Configuration Examples

**GitHub repository settings:**

```yaml
# .github/branch-protection.yml (if using GitHub CLI)
protection_rules:
  main:
    required_status_checks:
      strict: true
      contexts:
        - "Test Suite"
        - "Integration Tests" 
        - "End-to-End Tests"
        - "Security Audit"
    required_pull_request_reviews:
      required_approving_review_count: 1
      dismiss_stale_reviews: true
    restrictions: null
    enforce_admins: true
```

## Code Quality Gates

### Pre-merge Requirements

All pull requests must pass:

1. **Build verification**
   ```bash
   npm run build
   ```

2. **Code quality checks**
   ```bash
   npm run lint
   npm run lint:fix  # if needed
   ```

3. **Test coverage**
   ```bash
   npm run test:coverage
   # Minimum 80% coverage required
   ```

4. **Integration validation**
   ```bash
   npm run test:integration
   ```

5. **Security compliance**
   ```bash
   npm audit --audit-level moderate
   ```

### Performance Requirements

- **Unit tests**: < 30 seconds total execution
- **Integration tests**: < 2 minutes total execution  
- **E2E tests**: < 10 minutes total execution
- **Build time**: < 1 minute
- **Bundle size**: Monitor for significant increases

## Reviewer Guidelines

### Review Criteria

When reviewing pull requests, check:

- [ ] **Code Quality**: Follows project conventions
- [ ] **Test Coverage**: New code has appropriate tests
- [ ] **Documentation**: Changes are documented
- [ ] **Security**: No security vulnerabilities introduced
- [ ] **Performance**: No performance regressions
- [ ] **Breaking Changes**: Properly documented and versioned

### Review Process

1. **Automated checks** must pass first
2. **Manual review** for code quality and design
3. **Functional testing** if needed
4. **Approval** with constructive feedback

## Emergency Procedures

### Critical Security Issues

1. **Immediate response**: Create hotfix branch
2. **Fast-track review**: Single reviewer required
3. **Expedited deployment**: Skip non-critical checks
4. **Post-incident**: Full retrospective and process review

### Production Outages

1. **Rollback**: Revert to last known good release
2. **Hotfix**: Follow expedited hotfix process
3. **Communication**: Update stakeholders promptly
4. **Analysis**: Root cause analysis and prevention

## Enforcement

### Automated Enforcement

- **GitHub branch protection rules** enforce all requirements
- **CI/CD pipelines** validate code quality and functionality
- **Automated testing** provides rapid feedback
- **Security scanning** prevents vulnerable code deployment

### Manual Enforcement

- **Code review process** ensures human oversight
- **Release approval** requires explicit sign-off
- **Documentation review** maintains project standards
- **Compliance audits** verify adherence to procedures

## Monitoring and Metrics

### Key Metrics

- **PR merge time**: Target < 24 hours for non-release PRs
- **CI success rate**: Target > 95%
- **Test coverage**: Maintain > 80%
- **Security scan results**: Zero high-severity issues
- **Branch protection compliance**: 100%

### Reporting

- **Weekly CI/CD metrics** review
- **Monthly security audit** summary
- **Quarterly process improvement** review
- **Annual compliance** assessment

---

**This branch protection strategy ensures code quality, security, and reliability while maintaining development velocity and team collaboration.**