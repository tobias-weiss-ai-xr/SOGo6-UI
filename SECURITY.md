# Security Policy — SOGo6 UI

See the parent repository for the full policy:
https://github.com/tobias-weiss-ai-xr/SOGo6-dockerized/blob/main/SECURITY.md

## Reporting a Vulnerability

**Do not open public issues.** Report privately to the maintainers
(contact in the parent repo's SECURITY.md, or via
`/.well-known/security.txt` served by this UI).

- Acknowledgment: ≤ 48 h
- Fix (HIGH/CRITICAL): target ≤ 30 days
- Coordinated disclosure per CRA Art. 14(2)

## Scope

This repository contains the Next.js frontend. Vulnerabilities in
backend, mail, LDAP or database components belong to the parent
repository's policy and are handled by the same maintainers.

## Supply Chain (CRA Art. 13)

- Lockfile: `package-lock.json` (pinned)
- SBOM: generated via Trivy CycloneDX in CI (parent repo)
- Dependency scan: Trivy on the UI Dockerfile in CI
