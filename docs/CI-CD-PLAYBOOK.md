# CI/CD Playbook
## XFactor Viral Growth System

---

## Overview

This playbook documents the CI/CD pipeline for the XFactor viral growth system, including unit tests, integration tests, and end-to-end tests.

---

## Pipeline Stages

### 1. Lint & Type Check
**Purpose**: Ensure code quality and type safety

**Steps**:
- Run ESLint
- TypeScript type checking
- Format validation

**Commands**:
```bash
npm run lint
npm run typecheck
```

**Failure Action**: Block merge, require fixes

---

### 2. Unit Tests
**Purpose**: Test individual components in isolation

**Coverage**:
- Agent logic (Orchestrator, Personalization, Experimentation)
- Service logic (Smart Links, Event Bus, etc.)
- Utility functions

**Commands**:
```bash
npm run test:unit
npm run test:coverage
```

**Location**: `tests/unit/`

**Target Coverage**: >80%

**Examples**:
- `tests/unit/agents/orchestrator.test.ts`
- `tests/unit/agents/personalization.test.ts`
- `tests/unit/services/smart-links.test.ts`

---

### 3. Integration Tests
**Purpose**: Test component interactions

**Coverage**:
- Viral loop execution flow
- Session intelligence pipeline
- Agent communication
- Service integration

**Commands**:
```bash
npm run test:integration
```

**Location**: `tests/integration/`

**Examples**:
- `tests/integration/viral-loop-flow.test.ts`
- `tests/integration/session-intelligence.test.ts`

---

### 4. End-to-End Tests
**Purpose**: Test complete user journeys

**Coverage**:
- Complete user flows
- Attribution chains
- K-factor calculation
- Compliance flows

**Commands**:
```bash
npm run test:e2e
```

**Location**: `tests/e2e/`

**Examples**:
- `tests/e2e/complete-user-journey.test.ts`

---

### 5. Acceptance Tests
**Purpose**: Verify PRD requirements are met

**Coverage**:
- AC1: ≥4 Viral Loops
- AC2: ≥4 Agentic Actions
- AC3: K-Factor ≥ 1.20
- AC4: Presence UI & Leaderboard
- AC5: Compliance Memo
- AC6: Results-Page Sharing

**Commands**:
```bash
npm run test:acceptance
```

**Location**: `tests/acceptance/`

**Examples**:
- `tests/acceptance/prd-requirements.test.ts`

---

### 6. Security Tests
**Purpose**: Security and compliance verification

**Coverage**:
- COPPA/FERPA compliance
- Fraud detection
- Abuse prevention
- Input validation
- Injection prevention

**Commands**:
```bash
npm run test:security
```

**Location**: `tests/security/`

**Examples**:
- `tests/security/coppa-ferpa.test.ts`
- `tests/security/fraud-detection.test.ts`
- `tests/security/input-validation.test.ts`

---

### 7. Performance Tests
**Purpose**: Performance and scalability verification

**Coverage**:
- Load testing (concurrent users)
- Throughput (events/sec)
- Response time (SLA compliance)
- Memory usage

**Commands**:
```bash
npm run test:performance
```

**Location**: `tests/performance/`

**Examples**:
- `tests/performance/load.test.ts`
- `tests/performance/throughput.test.ts`

---

### 5. Build
**Purpose**: Verify compilation

**Steps**:
- TypeScript compilation
- Build artifact generation
- Artifact upload

**Commands**:
```bash
npm run build
```

**Failure Action**: Block deployment

---

## GitHub Actions Workflows

### CI Pipeline (`.github/workflows/ci.yml`)

**Triggers**:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs**:
1. **lint**: Lint and type check
2. **unit-tests**: Run unit tests
3. **integration-tests**: Run integration tests
4. **e2e-tests**: Run E2E tests
5. **build**: Build project
6. **all-tests**: Summary of all tests

**Parallel Execution**: All test jobs run in parallel for speed

---

### CD Pipeline (`.github/workflows/cd.yml`)

**Triggers**:
- Push to `main` branch → Deploy to staging
- Tag `v*` → Deploy to production

**Steps**:
1. Build
2. Run all tests
3. Deploy to staging/production
4. Create release (if production)

---

## Test Strategy

### Unit Tests
- **Focus**: Individual functions and classes
- **Mocking**: External dependencies mocked
- **Speed**: Fast (<100ms per test)
- **Coverage**: Critical paths

### Integration Tests
- **Focus**: Component interactions
- **Mocking**: Minimal mocking, real services
- **Speed**: Medium (<1s per test)
- **Coverage**: Key integration points

### E2E Tests
- **Focus**: Complete user journeys
- **Mocking**: Minimal, use test data
- **Speed**: Slower (<10s per test)
- **Coverage**: Critical user paths

---

## Running Tests Locally

### All Tests
```bash
npm test
```

### Specific Test Suite
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

Coverage report generated in `coverage/` directory.

---

## Test Data Management

### Fixtures
- Test data stored in `tests/fixtures/`
- Reusable across test suites
- Version controlled

### Mocking
- Use Vitest mocks for external services
- Mock event bus for isolated tests
- Mock agent responses for unit tests

### Test Isolation
- Each test should be independent
- No shared state between tests
- Clean up after each test

---

## Coverage Requirements

### Minimum Coverage
- **Unit Tests**: >80%
- **Integration Tests**: >60%
- **E2E Tests**: Critical paths only
- **Acceptance Tests**: 100% (all PRD requirements)
- **Security Tests**: 100% (all security requirements)
- **Performance Tests**: All requirements verified

### Critical Paths (Must Have Tests)
- Viral loop execution
- Session intelligence pipeline
- Agent communication
- Event bus publishing
- Trust & safety checks
- Analytics calculation

---

## Continuous Deployment

### Staging Deployment
- **Trigger**: Push to `main`
- **Auto-deploy**: Yes
- **Environment**: Staging
- **Verification**: Automated smoke tests

### Production Deployment
- **Trigger**: Tag `v*` (e.g., `v1.0.0`)
- **Auto-deploy**: Yes (after tests pass)
- **Environment**: Production
- **Verification**: Automated smoke tests + manual approval

---

## Rollback Procedure

### Automatic Rollback
- If health checks fail after deployment
- If critical tests fail in production environment
- Rollback to previous version

### Manual Rollback
```bash
# Tag previous version
git tag v1.0.0-rollback

# Deploy rollback tag
git push origin v1.0.0-rollback
```

---

## Monitoring

### Test Metrics
- Test execution time
- Test pass/fail rates
- Coverage trends
- Flaky test detection

### Deployment Metrics
- Deployment frequency
- Lead time
- Mean time to recovery (MTTR)
- Change failure rate

---

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Clear test structure
2. **Descriptive Names**: Test names explain what they test
3. **Single Responsibility**: One assertion per test (when possible)
4. **Fast Tests**: Unit tests should be fast
5. **Deterministic**: Tests should be predictable

### Maintaining Tests
1. **Update with Code**: Tests updated with features
2. **Remove Dead Tests**: Delete obsolete tests
3. **Fix Flaky Tests**: Investigate and fix immediately
4. **Review Coverage**: Regular coverage reviews

### CI/CD Best Practices
1. **Fail Fast**: Run fast tests first
2. **Parallel Execution**: Run independent tests in parallel
3. **Cache Dependencies**: Cache npm dependencies
4. **Artifact Management**: Store build artifacts
5. **Notifications**: Notify on failures

---

## Troubleshooting

### Common Issues

#### Tests Fail Locally but Pass in CI
- Check Node.js version matches
- Verify environment variables
- Check for platform-specific issues

#### Slow Test Execution
- Review test parallelization
- Check for unnecessary waits
- Optimize test data setup

#### Flaky Tests
- Identify timing issues
- Check for race conditions
- Review test isolation

---

## Next Steps

### Future Enhancements
- [ ] Performance testing
- [ ] Load testing
- [ ] Security scanning
- [ ] Dependency vulnerability scanning
- [ ] Automated security tests

---

## Contact

For CI/CD questions:
- **Email**: devops@varsitytutors.com
- **Slack**: #xfactor-ci-cd

---

**Last Updated**: January 2025

