# Repository-name migration record

```text
REPOSITORY_ID=1221155447
CURRENT_FULL_NAME=appolon1908-hue/Frontend-Resturant-
TARGET_FULL_NAME=appolon1908-hue/restaurant-frontend
STATUS=PREPARED_NOT_RENAMED
RUNTIME_CRITICAL=YES
```

## Authority decision

The target name corrects the legacy spelling and matches the canonical service name `restaurant-frontend`. The repository ID, Git history, issues, pull requests, branches, releases, and protection must remain unchanged through the rename.

Until GitHub readback proves repository ID `1221155447` at the target full name, all operational references continue to use `appolon1908-hue/Frontend-Resturant-`.

## Pre-cutover inventory

Record the exact default-branch SHA, branch protection/rulesets, open pull requests, Actions workflows, Environment rules, deploy-key fingerprints, webhook and GitHub App bindings, package/image names, badges, current Git remotes, server checkouts, infrastructure references, and currently deployed image digest.

Do not capture secret values.

## Cutover checks

1. Freeze merges and deployments for this repository.
2. Rename only this repository through an authorized GitHub owner/admin action.
3. Prove the repository ID and default-branch SHA are unchanged.
4. Verify old and new web/Git URLs, required checks, workflows, environments, packages, and deploy keys.
5. Update mutable Grafana/Prometheus catalogs, source labels, CI references, server remotes, and deployment manifests to the new full name.
6. Keep dated source locks and historical evidence unchanged.
7. Prove the runtime image digest and application behavior did not change.
8. Rehearse rollback to the prior slug.

Required metadata-only result:

```text
WORKLOADS_RESTARTED=0
IMAGES_REBUILT=0
DATABASE_MIGRATIONS=0
PRODUCTION_TRAFFIC_CHANGED=NO
```

The account-wide authority and complete rollback procedure live in `appolon1908-hue/documentaions` under `repository-name-migration.v1.json` and `REPOSITORY_NAME_MIGRATION_2026-09-02.md` until that documentation repository completes its own controlled rename.