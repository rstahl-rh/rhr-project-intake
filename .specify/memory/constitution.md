<!--
Sync Impact Report:
- Version: Template → 1.0.0 (Initial ratification)
- Modified principles: N/A (new constitution)
- Added sections: All sections (initial creation)
- Removed sections: None
- Templates requiring updates:
  ✅ plan-template.md - Constitution Check section already present
  ✅ spec-template.md - No changes needed (focuses on user stories/requirements)
  ✅ tasks-template.md - Updated to enforce mandatory unit tests (Principle III)
- Follow-up TODOs: None
-->

# RHR Project Intake Constitution

## Core Principles

### I. Code Readability

All code MUST prioritize clarity and maintainability over cleverness.

**Requirements:**
- Use descriptive variable, function, and class names that convey intent
- Limit function complexity: functions should do one thing well
- Maximum function length: 50 lines (excluding whitespace and comments)
- Maximum cyclomatic complexity: 10 per function
- Code structure must be self-documenting; comments explain "why", not "what"
- Consistent formatting enforced via automated tools (linters, formatters)

**Rationale:** Readable code reduces onboarding time, simplifies debugging, and enables confident refactoring. In collaborative environments, code is read far more often than it is written.

### II. Containerized Deployment

All deployments MUST use containers as the primary runtime environment.

**Requirements:**
- Applications MUST run in OCI-compliant containers (Docker, Podman, etc.)
- Containers MUST be built from minimal base images (Alpine, distroless, or equivalent)
- Container images MUST NOT contain development tools, package managers, or unnecessary utilities in production builds
- Multi-stage builds MUST be used to separate build-time and runtime dependencies
- Container configuration MUST be externalized via environment variables or mounted config files
- Container health checks MUST be defined and tested
- All container images MUST be tagged with semantic versions

**Rationale:** Containerization ensures environment parity across development, testing, and production. It simplifies deployment, enables horizontal scaling, and provides isolation for security and resource management.

### III. Unit Testing

Comprehensive unit test coverage is MANDATORY for all production code.

**Requirements:**
- Minimum code coverage: 80% for all new code
- Unit tests MUST be isolated: no external dependencies (databases, APIs, file systems)
- Test naming MUST clearly describe the scenario: `test_<function>_<scenario>_<expected_result>`
- Each test MUST verify exactly one behavior
- Tests MUST run in under 5 seconds total for the entire unit test suite
- All tests MUST pass before code can be merged
- Test failures MUST halt CI/CD pipelines
- Mock/stub external dependencies; avoid brittle integration tests in unit test suites

**Rationale:** Unit tests provide immediate feedback on code correctness, enable safe refactoring, and serve as executable documentation. Fast, isolated tests encourage frequent execution during development.

### IV. Security Scanning

Automated security scanning is NON-NEGOTIABLE for all code and dependencies.

**Requirements:**
- All pull requests MUST pass automated security scans before merge
- Dependency scanning MUST run on every commit (Dependabot, Snyk, or equivalent)
- Static Application Security Testing (SAST) MUST be integrated into CI/CD
- Container image scanning MUST be performed before registry push (Trivy, Clair, or equivalent)
- Critical and high-severity vulnerabilities MUST be remediated within 7 days
- Medium-severity vulnerabilities MUST be remediated within 30 days
- Security scan results MUST be reviewed and acknowledged; suppression requires justification
- Secret scanning MUST prevent credentials from being committed (git-secrets, detect-secrets, or equivalent)

**Rationale:** Proactive security scanning prevents vulnerabilities from reaching production, reduces incident response costs, and maintains compliance with security standards. Automated enforcement removes human error from the security review process.

## Quality Gates

All code changes MUST pass the following gates before merge:

**Gate 1: Automated Checks**
- All unit tests pass
- Code coverage meets 80% threshold
- Linting passes with zero errors
- Container builds successfully
- Security scans show no critical/high vulnerabilities

**Gate 2: Code Review**
- At least one peer review approval required
- Reviewer MUST verify:
  - Code readability (Principle I compliance)
  - Test coverage and quality (Principle III compliance)
  - Container configuration correctness (Principle II compliance)
  - Security scan results reviewed (Principle IV compliance)

**Gate 3: Integration Validation**
- Container deploys successfully in staging environment
- Health checks pass
- Integration tests pass (if applicable)

## Development Workflow

**Pre-commit:**
- Run local linters and formatters
- Execute unit tests
- Perform local container build test

**Pull Request:**
- Automated CI runs all quality gates
- Code review with constitutional compliance check
- Address all feedback before merge

**Merge to Main:**
- All gates must pass
- Automated deployment to staging
- Security scans executed on deployed artifacts

**Release:**
- Tagged semantic version
- Container image pushed to registry with version tag
- Security scan results archived with release notes

## Governance

This constitution supersedes all other development practices and standards.

**Amendment Process:**
1. Proposed amendments MUST be documented with rationale
2. Amendments require approval from project maintainers
3. Breaking changes to principles require migration plan
4. Version incremented according to semantic versioning

**Compliance Verification:**
- All pull requests MUST include constitutional compliance verification
- CI/CD pipelines enforce all automated requirements
- Code reviews verify human-judgment requirements
- Non-compliance blocks merge

**Version Management:**
- MAJOR: Backward incompatible principle changes or removals
- MINOR: New principles added or existing principles expanded
- PATCH: Clarifications, wording improvements, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2026-03-12 | **Last Amended**: 2026-03-12
