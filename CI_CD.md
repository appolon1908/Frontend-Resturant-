# CI/CD authority

## Repository

- Repository: `appolon1908-hue/Frontend-Resturant-`
- Class: `frontend`
- Purpose: Nuxt 3 restaurant-booking frontend
- Implementation authority: `frontend/package.json` and the Nuxt application under `frontend/`

## Persistent branches

This repository uses the following persistent branch train:

```text
development
test
staging
production
main
```

Feature and repair branches may be created from `development`. Promotion should proceed by reviewed pull request in this order:

```text
feature/fix -> development -> test -> staging -> production -> main
```

The initial branch bootstrap intentionally places the same CI/CD policy commit on all five persistent branches. That bootstrap is not production deployment evidence.

## Required CI

`.github/workflows/required-ci.yml` runs on every push, every pull request, and manual dispatch. It:

- checks out the exact event SHA with persisted Git credentials disabled;
- verifies a clean exact-source checkout;
- downloads a checksum-verified Gitleaks binary and rejects committed secrets;
- parses repository JSON and YAML;
- checks local Markdown links and unsafe escaping symlinks;
- discovers Node, Python, Docker, Compose, and documentation sources;
- installs dependencies using committed lockfiles when available;
- runs declared Node lint, typecheck, test, and build scripts;
- compiles and tests Python projects when present;
- validates Compose definitions and builds Dockerfiles when present;
- uploads a sanitized CI evidence artifact;
- never authorizes runtime deployment or external effects.

## Every-branch audit

`.github/workflows/all-branches-audit.yml` runs daily and on manual dispatch. It fetches every branch tip, checks each one in an isolated worktree, and applies the same static repository contract. This covers older branches that were created before this CI/CD policy existed.

## Continuous delivery

`.github/workflows/continuous-delivery.yml` runs only on the five persistent branches. It:

- reruns release-mode validation against the exact branch SHA;
- creates deterministic source and build-output archives;
- records the exact Git source tree and SHA;
- records SHA-256 checksums for every delivered artifact;
- publishes an immutable GHCR candidate only when a Dockerfile exists and every discovered Node project has a committed lockfile;
- uploads a 90-day release-evidence artifact;
- records `runtime_deployment_authorized=false` and `external_effects_authorized=false`.

Continuous delivery is therefore complete at the artifact boundary. Runtime deployment is intentionally separate because no canonical server target, protected runtime credential, health contract, backup/restore evidence, or rollback authority is established by this repository policy.

## Repository-specific status

The current application has no committed dependency lockfile. CI can validate it, but GHCR image publication remains blocked until a lockfile and reviewed Dockerfile are present.

## Required GitHub settings

After the bootstrap PR is merged, configure the five persistent branches or equivalent repository rulesets to require:

- `required-ci`;
- at least one approving review;
- resolved review conversations;
- linear history;
- no force pushes;
- no branch deletion;
- branch up-to-date enforcement for protected promotions.

Any future runtime deployment workflow must use protected GitHub environments, exact source SHAs, immutable image digests, explicit rollback evidence, and no secret values committed to Git.
