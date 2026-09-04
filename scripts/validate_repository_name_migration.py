#!/usr/bin/env python3
"""Validate the controlled restaurant frontend repository-name migration."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "repository-name-migration.v1.json"
README = ROOT / "README.md"
RUNBOOK = ROOT / "REPOSITORY_NAME_MIGRATION.md"
VALIDATOR = Path(__file__).resolve()
FRONTEND = ROOT / "frontend"
CURRENT = "appolon1908-hue/Frontend-Resturant-"
TARGET = "appolon1908-hue/restaurant-frontend"

TEXT_SUFFIXES = {
    ".bash",
    ".cfg",
    ".conf",
    ".env",
    ".hcl",
    ".ini",
    ".js",
    ".json",
    ".mjs",
    ".cjs",
    ".properties",
    ".ps1",
    ".py",
    ".sh",
    ".tf",
    ".tfvars",
    ".toml",
    ".ts",
    ".tsx",
    ".vue",
    ".xml",
    ".yaml",
    ".yml",
    ".zsh",
}
OPERATIONAL_ROOTS = {
    ".github",
    "deploy",
    "deployment",
    "frontend",
    "infra",
    "infrastructure",
    "scripts",
}
EXCLUDED_PARTS = {
    ".git",
    ".nuxt",
    ".output",
    "coverage",
    "dist",
    "node_modules",
}
ROOT_OPERATIONAL_NAMES = {
    ".gitmodules",
    "Caddyfile",
    "Dockerfile",
    "Makefile",
    "compose.yaml",
    "compose.yml",
    "docker-compose.yaml",
    "docker-compose.yml",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
}


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load() -> dict[str, Any]:
    try:
        value = json.loads(MANIFEST.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"invalid repository migration JSON: {exc}")
    if not isinstance(value, dict):
        fail("repository migration root must be an object")
    return value


def is_operational_source(path: Path) -> bool:
    try:
        relative = path.resolve().relative_to(ROOT.resolve())
    except ValueError:
        return False

    if path.resolve() in {
        MANIFEST.resolve(),
        README.resolve(),
        RUNBOOK.resolve(),
        VALIDATOR,
    }:
        return False
    if any(part in EXCLUDED_PARTS for part in relative.parts):
        return False
    if relative.name in ROOT_OPERATIONAL_NAMES:
        return True
    if relative.parts and relative.parts[0] in OPERATIONAL_ROOTS:
        return relative.suffix.lower() in TEXT_SUFFIXES or relative.name in {
            "Caddyfile",
            "Dockerfile",
            "Makefile",
        }
    return False


def validate_target_absent_from_operational_sources() -> None:
    target = TARGET.lower()
    for path in ROOT.rglob("*"):
        if not path.is_file() or not is_operational_source(path):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore").lower()
        if target in text:
            fail(
                "target repository is used by active automation or deployment "
                f"source before cutover: {path.relative_to(ROOT)}"
            )


def validate() -> None:
    document = load()
    expected = {
        "schema_version": "1.0",
        "repository_id": 1221155447,
        "current_repository": CURRENT,
        "target_repository_after_cutover": TARGET,
        "status": "PREPARED_NOT_RENAMED",
        "runtime_critical": True,
        "current_runtime_state": "REQUIRES_PRE_CUTOVER_DISCOVERY",
        "runtime_digest_evidence": "CURRENT_AND_ROLLBACK_WHEN_DEPLOYED_OTHERWISE_NOT_APPLICABLE",
        "authority_role": "Restaurant customer and operations frontend",
        "account_authority": (
            "appolon1908-hue/documentaions:repository-name-migration.v1.json"
        ),
    }
    for key, value in expected.items():
        if document.get(key) != value:
            fail(f"repository migration field {key} is incorrect")

    policy = document.get("policy")
    if not isinstance(policy, dict):
        fail("repository migration policy is missing")
    for key in (
        "current_repository_remains_operational",
        "target_repository_forbidden_in_automation_before_cutover",
        "same_repository_id_required_after_cutover",
        "historical_evidence_immutable",
        "all_inventoried_integrations_require_post_rename_readback",
        "runtime_digest_must_remain_unchanged_when_deployed",
        "absent_runtime_digest_must_be_recorded_as_not_applicable",
        "success_path_must_restore_freeze_state",
        "rollback_path_must_restore_freeze_state",
    ):
        if policy.get(key) is not True:
            fail(f"required fail-closed migration policy is not true: {key}")
    if policy.get("rename_authorizes_deployment") is not False:
        fail("repository rename must not authorize deployment")

    readme = README.read_text(encoding="utf-8")
    for required in (
        "STABLE_GITHUB_REPOSITORY_ID=1221155447",
        f"CURRENT_OPERATIONAL_REPOSITORY={CURRENT}",
        f"APPROVED_TARGET_AFTER_CONTROLLED_RENAME={TARGET}",
        "RENAME_STATUS=PREPARED_NOT_RENAMED",
    ):
        if required not in readme:
            fail(f"README is missing stable repository evidence: {required}")

    runbook = RUNBOOK.read_text(encoding="utf-8")
    for required in (
        "POST_RENAME_INTEGRATION_READBACK=PASS",
        "ACTIONS_REQUIRED_CHECKS=PASS",
        "PACKAGES_GHCR=PASS|N/A",
        "DEPLOY_KEYS_APPS_WEBHOOKS=PASS|N/A",
        "DOWNSTREAM_CONSUMERS=PASS",
        "CURRENT_RUNTIME_STATE=DEPLOYED|NOT_DEPLOYED",
        "DEPLOYED_IMAGE_DIGEST=<immutable-digest>|N/A",
        "RUNTIME_DIGEST_UNCHANGED=PASS|N/A",
        "MERGES_UNFROZEN=PASS",
        "RELEASE_DISPATCH_UNFROZEN=PASS|N/A",
        "WORKFLOW_DISPATCH_UNFROZEN=PASS|N/A",
        "DEPLOYMENT_DISPATCH_RESTORED=PASS|N/A",
        "ROLLBACK_UNFREEZE=PASS|N/A",
        "Do not leave the repository frozen.",
        "WORKLOADS_RESTARTED=0",
        "IMAGES_REBUILT=0",
        "DATABASE_MIGRATIONS=0",
        "PRODUCTION_TRAFFIC_CHANGED=NO",
    ):
        if required not in runbook:
            fail(f"rename runbook is missing required evidence: {required}")

    if not FRONTEND.is_dir():
        fail("restaurant frontend source directory is missing")
    validate_target_absent_from_operational_sources()


def main() -> None:
    validate()
    print("Restaurant frontend repository-name migration authority: PASS")


if __name__ == "__main__":
    main()
