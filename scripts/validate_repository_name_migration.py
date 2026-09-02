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
FRONTEND = ROOT / "frontend"
CURRENT = "appolon1908-hue/Frontend-Resturant-"
TARGET = "appolon1908-hue/restaurant-frontend"


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


def validate() -> None:
    document = load()
    expected = {
        "schema_version": "1.0",
        "repository_id": 1221155447,
        "current_repository": CURRENT,
        "target_repository_after_cutover": TARGET,
        "status": "PREPARED_NOT_RENAMED",
        "runtime_critical": True,
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
        "runtime_digest_must_remain_unchanged",
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
        "WORKLOADS_RESTARTED=0",
        "IMAGES_REBUILT=0",
        "DATABASE_MIGRATIONS=0",
        "PRODUCTION_TRAFFIC_CHANGED=NO",
    ):
        if required not in runbook:
            fail(f"rename runbook is missing zero-change evidence: {required}")

    if not FRONTEND.is_dir():
        fail("restaurant frontend source directory is missing")
    for path in FRONTEND.rglob("*"):
        if not path.is_file() or path.suffix.lower() in {
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".woff",
            ".woff2",
        }:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if TARGET in text:
            fail(
                "target repository is used by active frontend source before cutover: "
                f"{path.relative_to(ROOT)}"
            )


def main() -> None:
    validate()
    print("Restaurant frontend repository-name migration authority: PASS")


if __name__ == "__main__":
    main()
