# Repository-name migration record

```text
REPOSITORY_ID=1221155447
CURRENT_FULL_NAME=appolon1908-hue/Frontend-Resturant-
TARGET_FULL_NAME=appolon1908-hue/restaurant-frontend
STATUS=PREPARED_NOT_RENAMED
RUNTIME_CRITICAL=YES
CURRENT_RUNTIME_STATE=REQUIRES_PRE_CUTOVER_DISCOVERY
```

## Authority decision

The target name corrects the legacy spelling and matches the canonical service name `restaurant-frontend`. The repository ID, Git history, issues, pull requests, branches, releases, protection, workflows, and integrations must remain unchanged through the rename.

Until GitHub readback proves repository ID `1221155447` at the target full name, all operational references continue to use `appolon1908-hue/Frontend-Resturant-`.

## Pre-cutover inventory

Record the exact default-branch SHA, visibility, branch protection and rulesets, CODEOWNERS, required checks, open pull requests, Actions and reusable workflows, Environment rules, package and GHCR identities, deploy-key fingerprints, webhook and GitHub App bindings, Pages state, badges, current Git remotes, server checkouts, infrastructure references, current source locks, and the exact merge and dispatch state being frozen. Do not capture secret values.

Discover the current runtime state immediately before cutover:

- when a reviewed deployment exists, record its immutable image and rollback digests and prove they remain unchanged;
- when no deployment exists, record `CURRENT_RUNTIME_STATE=NOT_DEPLOYED`, `DEPLOYED_IMAGE_DIGEST=N/A`, and `RUNTIME_DIGEST_UNCHANGED=N/A`;
- do not fabricate runtime evidence.

## Controlled cutover

1. Merge stable-ID alias awareness into Grafana, Prometheus, Middleware, infrastructure, documentation, and other active consumers.
2. Freeze merges, release dispatches, workflow dispatches, and deployment dispatches for this repository; record the prior state.
3. Rename only this repository through an authorized GitHub owner or administrator action.
4. Before changing consumers, prove the same repository ID, visibility, default branch and SHA, history, protection, CODEOWNERS, required checks, issues, pull requests, tags, releases, Actions, reusable workflows, Environments, packages, GHCR identities, deploy keys, GitHub Apps, webhooks, and Pages state.
5. Stop and roll back if any inventoried integration is missing, weakened, or unresolved.
6. Update only mutable current-state references, including catalogs, workflows, source labels, packages, server remotes, and deployment manifests. Keep dated evidence unchanged.
7. Re-run frontend validation, workflow resolution, package checks, deployment preflight, and all downstream consumer checks.
8. When a deployment exists, prove its runtime digest and application behavior are unchanged. Otherwise preserve the explicit `N/A` runtime result.
9. Verify no reservation, order, payment, kitchen, realtime, or production traffic behavior changed.
10. Rehearse rollback to the prior slug.
11. After success or validated rollback, restore the exact recorded merge, release-dispatch, workflow-dispatch, and deployment-dispatch state. Do not leave the repository frozen.

## Rollback

Rollback restores the prior slug when safe, restores mutable references and remote URLs from the checksum-bound pre-change packet, repeats the complete integration and runtime readback, verifies no restaurant operation changed, and then restores the recorded freeze state. A successful rollback must not leave repository operations disabled.

Required metadata-only result:

```text
POST_RENAME_INTEGRATION_READBACK=PASS
ACTIONS_REQUIRED_CHECKS=PASS
PACKAGES_GHCR=PASS|N/A
DEPLOY_KEYS_APPS_WEBHOOKS=PASS|N/A
DOWNSTREAM_CONSUMERS=PASS
CURRENT_RUNTIME_STATE=DEPLOYED|NOT_DEPLOYED
DEPLOYED_IMAGE_DIGEST=<immutable-digest>|N/A
RUNTIME_DIGEST_UNCHANGED=PASS|N/A
MERGES_UNFROZEN=PASS
RELEASE_DISPATCH_UNFROZEN=PASS|N/A
WORKFLOW_DISPATCH_UNFROZEN=PASS|N/A
DEPLOYMENT_DISPATCH_RESTORED=PASS|N/A
ROLLBACK_UNFREEZE=PASS|N/A
WORKLOADS_RESTARTED=0
IMAGES_REBUILT=0
DATABASE_MIGRATIONS=0
PRODUCTION_TRAFFIC_CHANGED=NO
```

The account-wide authority and complete rollback procedure live in `appolon1908-hue/documentaions` under `repository-name-migration.v1.json` and `REPOSITORY_NAME_MIGRATION_2026-09-02.md` until that documentation repository completes its own controlled rename.
