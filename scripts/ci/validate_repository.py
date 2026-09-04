#!/usr/bin/env python3
"""Repository-aware CI/CD validation shared by all persistent branches."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable

EXCLUDED_PARTS = {
    ".git",
    ".nuxt",
    ".output",
    ".venv",
    ".venv-ci",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "vendor",
}
PERSISTENT_BRANCHES = {"development", "test", "staging", "production", "main"}
RELEASE_BRANCHES = {"staging", "production", "main"}
NODE_SCRIPTS = ("lint", "typecheck", "test", "build")
PRIVATE_KEY_MARKERS = tuple(
    "-----BEGIN " + prefix + "PRIVATE KEY-----"
    for prefix in ("", "RSA ", "EC ", "OPENSSH ")
)
TOKEN_PATTERNS = (
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{30,}\b"),
)
MARKDOWN_LINK = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")


class ValidationError(RuntimeError):
    pass


def fail(message: str) -> None:
    raise ValidationError(message)


def run(
    argv: list[str],
    *,
    cwd: Path,
    env: dict[str, str] | None = None,
    timeout: int = 900,
) -> None:
    print(f"+ ({cwd}) {' '.join(argv)}", flush=True)
    completed = subprocess.run(
        argv,
        cwd=cwd,
        env=env,
        text=True,
        check=False,
        timeout=timeout,
    )
    if completed.returncode != 0:
        fail(f"command failed with exit code {completed.returncode}: {' '.join(argv)}")


def iter_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        if any(part in EXCLUDED_PARTS for part in path.parts):
            continue
        if path.is_file():
            yield path


def relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def validate_paths(root: Path) -> None:
    for path in root.rglob("*"):
        if any(part in EXCLUDED_PARTS for part in path.parts):
            continue
        if path.is_symlink():
            target = path.resolve(strict=False)
            try:
                target.relative_to(root)
            except ValueError:
                fail(f"symlink escapes repository: {relative(path, root)} -> {target}")
        if path.is_file() and path.stat().st_size > 50 * 1024 * 1024:
            fail(f"repository file exceeds 50 MiB: {relative(path, root)}")


def validate_json(root: Path) -> int:
    count = 0
    for path in iter_files(root):
        if path.suffix.lower() != ".json" or path.stat().st_size > 5 * 1024 * 1024:
            continue
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
            fail(f"invalid JSON in {relative(path, root)}: {exc}")
        count += 1
    return count


def validate_yaml(root: Path) -> int:
    try:
        import yaml  # type: ignore
    except ImportError as exc:
        fail(f"PyYAML is required: {exc}")

    count = 0
    for path in iter_files(root):
        if path.suffix.lower() not in {".yaml", ".yml"} or path.stat().st_size > 5 * 1024 * 1024:
            continue
        try:
            list(yaml.safe_load_all(path.read_text(encoding="utf-8")))
        except (OSError, UnicodeDecodeError, yaml.YAMLError) as exc:
            fail(f"invalid YAML in {relative(path, root)}: {exc}")
        count += 1
    return count


def validate_markdown_links(root: Path) -> int:
    checked = 0
    for path in iter_files(root):
        if path.suffix.lower() not in {".md", ".mdx"} or path.stat().st_size > 5 * 1024 * 1024:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for raw in MARKDOWN_LINK.findall(text):
            target = raw.strip().split(maxsplit=1)[0].strip("<>")
            if (
                not target
                or target.startswith(("#", "http://", "https://", "mailto:", "tel:", "data:"))
            ):
                continue
            target = target.split("#", 1)[0].split("?", 1)[0]
            if not target:
                continue
            destination = (path.parent / target).resolve(strict=False)
            try:
                destination.relative_to(root)
            except ValueError:
                fail(f"Markdown link escapes repository in {relative(path, root)}: {raw}")
            if not destination.exists():
                fail(f"broken local Markdown link in {relative(path, root)}: {raw}")
            checked += 1
    return checked


def validate_secret_shapes(root: Path) -> None:
    for path in iter_files(root):
        if path.stat().st_size > 2 * 1024 * 1024:
            continue
        if path.suffix.lower() in {
            ".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".zip", ".gz", ".tar",
            ".md", ".mdx", ".txt",
        }:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for marker in PRIVATE_KEY_MARKERS:
            if marker in text:
                fail(f"private-key material found in {relative(path, root)}")
        for pattern in TOKEN_PATTERNS:
            if pattern.search(text):
                fail(f"credential-shaped token found in {relative(path, root)}")


def node_manifests(root: Path) -> list[Path]:
    result: list[Path] = []
    for path in root.rglob("package.json"):
        if any(part in EXCLUDED_PARTS for part in path.parts):
            continue
        if len(path.relative_to(root).parts) <= 5:
            result.append(path)
    return sorted(result)


def python_roots(root: Path) -> list[Path]:
    candidates: set[Path] = set()
    for name in ("pyproject.toml", "setup.py", "setup.cfg", "requirements.txt"):
        for path in root.rglob(name):
            if any(part in EXCLUDED_PARTS for part in path.parts):
                continue
            if len(path.relative_to(root).parts) <= 5:
                candidates.add(path.parent)
    return sorted(candidates)


def dockerfiles(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("Dockerfile")
        if not any(part in EXCLUDED_PARTS for part in path.parts)
        and len(path.relative_to(root).parts) <= 5
    )


def script_exists(manifest: dict, name: str) -> bool:
    scripts = manifest.get("scripts")
    return isinstance(scripts, dict) and isinstance(scripts.get(name), str) and bool(scripts[name].strip())


def validate_javascript_syntax(directory: Path) -> None:
    for path in sorted(directory.rglob("*.js")):
        if any(part in EXCLUDED_PARTS for part in path.parts):
            continue
        run(["node", "--check", str(path)], cwd=directory, timeout=120)


def run_node_project(directory: Path, manifest_path: Path, mode: str, branch: str) -> None:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    package_lock = directory / "package-lock.json"
    pnpm_lock = directory / "pnpm-lock.yaml"
    yarn_lock = directory / "yarn.lock"

    env = dict(os.environ)
    env.update({"CI": "true", "NODE_ENV": "test"})

    if package_lock.is_file():
        run(["npm", "ci", "--no-audit", "--fund=false"], cwd=directory, env=env)
        runner = ["npm", "run"]
    elif pnpm_lock.is_file():
        run(["corepack", "enable"], cwd=directory, env=env)
        run(["pnpm", "install", "--frozen-lockfile"], cwd=directory, env=env)
        runner = ["pnpm", "run"]
    elif yarn_lock.is_file():
        run(["corepack", "enable"], cwd=directory, env=env)
        run(["yarn", "install", "--immutable"], cwd=directory, env=env)
        runner = ["yarn", "run"]
    else:
        if mode == "release" and branch in RELEASE_BRANCHES:
            print(f"WARNING=release branch lacks a dependency lockfile: {directory}")
        run(["npm", "install", "--no-audit", "--fund=false"], cwd=directory, env=env)
        runner = ["npm", "run"]

    validate_javascript_syntax(directory)

    for name in NODE_SCRIPTS:
        if not script_exists(manifest, name):
            continue
        command = [*runner, name]
        run(command, cwd=directory, env=env, timeout=1800)

    if package_lock.is_file() or (directory / "node_modules").exists():
        run(
            ["npm", "audit", "--omit=dev", "--audit-level=critical"],
            cwd=directory,
            env=env,
            timeout=600,
        )


def requirement_file(directory: Path) -> Path | None:
    preferred = (
        "requirements.lock",
        "requirements.txt",
        "requirements-dev.txt",
    )
    for name in preferred:
        path = directory / name
        if path.is_file():
            return path
    return None


def run_python_project(directory: Path, mode: str, branch: str) -> None:
    env = dict(os.environ)
    env.update({"PYTHONDONTWRITEBYTECODE": "1", "PYTHONUNBUFFERED": "1"})
    venv = directory / ".venv-ci"
    if venv.exists():
        shutil.rmtree(venv)
    run([sys.executable, "-m", "venv", str(venv)], cwd=directory)
    python = venv / "bin" / "python"
    run([str(python), "-m", "pip", "install", "--disable-pip-version-check", "--no-input", "--upgrade", "pip"], cwd=directory)

    requirements = requirement_file(directory)
    if requirements is not None:
        if mode == "release" and branch in RELEASE_BRANCHES and requirements.name != "requirements.lock":
            print(f"WARNING=release uses {requirements.name}; add requirements.lock for full reproducibility")
        run([str(python), "-m", "pip", "install", "--disable-pip-version-check", "--no-input", "-r", requirements.name], cwd=directory, timeout=1800)
    elif (directory / "pyproject.toml").is_file():
        run([str(python), "-m", "pip", "install", "--disable-pip-version-check", "--no-input", "-e", "."], cwd=directory, timeout=1800)

    run([str(python), "-m", "compileall", "-q", "."], cwd=directory, env=env)
    tests = directory / "tests"
    if tests.is_dir():
        run([str(python), "-m", "pip", "install", "--disable-pip-version-check", "--no-input", "pytest==8.4.2"], cwd=directory)
        run([str(python), "-m", "pytest", "-q"], cwd=directory, env=env, timeout=1800)

    run([str(python), "-m", "pip", "check"], cwd=directory, env=env)
    shutil.rmtree(venv, ignore_errors=True)


def run_compose_checks(root: Path) -> None:
    names = (
        "compose.yml",
        "compose.yaml",
        "docker-compose.yml",
        "docker-compose.yaml",
    )
    for name in names:
        for path in root.rglob(name):
            if any(part in EXCLUDED_PARTS for part in path.parts):
                continue
            command = ["docker", "compose"]
            env_example = path.parent / ".env.example"
            if env_example.is_file():
                command.extend(["--env-file", str(env_example)])
            command.extend(["-f", str(path), "config", "--quiet"])
            try:
                run(command, cwd=path.parent, timeout=300)
            except ValidationError as exc:
                print(f"WARNING=compose static rendering unavailable for {relative(path, root)}: {exc}")


def run_docker_builds(root: Path, mode: str) -> None:
    if mode == "audit" or os.environ.get("SKIP_DOCKER_BUILD") == "1":
        return
    for dockerfile in dockerfiles(root):
        context = dockerfile.parent
        tag_seed = hashlib.sha256(str(dockerfile).encode("utf-8")).hexdigest()[:12]
        tag = f"codestra-ci:{tag_seed}"
        run(
            [
                "docker",
                "build",
                "--pull=false",
                "--label",
                f"org.opencontainers.image.revision={os.environ.get('GITHUB_SHA', 'local')}",
                "-f",
                str(dockerfile),
                "-t",
                tag,
                str(context),
            ],
            cwd=root,
            timeout=1800,
        )


def implementation_present(root: Path) -> bool:
    if node_manifests(root) or python_roots(root) or dockerfiles(root):
        return True
    extensions = {".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".rs", ".java", ".cs"}
    policy_prefixes = {(".github",), ("docs",), ("scripts", "ci")}
    for path in iter_files(root):
        parts = path.relative_to(root).parts
        if any(parts[: len(prefix)] == prefix for prefix in policy_prefixes):
            continue
        if path.suffix.lower() in extensions:
            return True
    return False


def write_evidence(
    path: Path | None,
    *,
    root: Path,
    branch: str,
    mode: str,
    repository_class: str,
    json_count: int,
    yaml_count: int,
    markdown_links: int,
) -> None:
    if path is None:
        return
    payload = {
        "schema_version": 1,
        "repository": os.environ.get("GITHUB_REPOSITORY"),
        "source_sha": os.environ.get("GITHUB_SHA"),
        "source_tree": subprocess.run(
            ["git", "rev-parse", "HEAD^{tree}"],
            cwd=root,
            check=False,
            capture_output=True,
            text=True,
        ).stdout.strip(),
        "branch": branch,
        "mode": mode,
        "repository_class": repository_class,
        "implementation_present": implementation_present(root),
        "node_projects": [relative(item, root) for item in node_manifests(root)],
        "python_projects": [relative(item, root) for item in python_roots(root)],
        "dockerfiles": [relative(item, root) for item in dockerfiles(root)],
        "validated_json_files": json_count,
        "validated_yaml_files": yaml_count,
        "validated_local_markdown_links": markdown_links,
        "runtime_deployment_authorized": False,
        "external_effects_authorized": False,
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path("."))
    parser.add_argument("--mode", choices=("audit", "ci", "release"), default="ci")
    parser.add_argument("--branch", default=os.environ.get("GITHUB_REF_NAME", "unknown"))
    parser.add_argument("--repository-class", default=os.environ.get("REPOSITORY_CLASS", "unclassified"))
    parser.add_argument("--evidence", type=Path)
    args = parser.parse_args()

    root = args.root.resolve()
    if not root.is_dir():
        fail(f"repository root does not exist: {root}")

    validate_paths(root)
    json_count = validate_json(root)
    yaml_count = validate_yaml(root)
    markdown_links = validate_markdown_links(root)
    validate_secret_shapes(root)

    node = node_manifests(root)
    python = python_roots(root)
    docker = dockerfiles(root)
    print(f"REPOSITORY_CLASS={args.repository_class}")
    print(f"BRANCH={args.branch}")
    print(f"NODE_PROJECTS={len(node)}")
    print(f"PYTHON_PROJECTS={len(python)}")
    print(f"DOCKERFILES={len(docker)}")

    if args.mode != "audit":
        for manifest in node:
            run_node_project(manifest.parent, manifest, args.mode, args.branch)
        for directory in python:
            run_python_project(directory, args.mode, args.branch)
        run_compose_checks(root)
        run_docker_builds(root, args.mode)

    if (
        args.mode == "release"
        and args.repository_class in {"frontend", "backend", "service"}
        and not implementation_present(root)
    ):
        fail("runtime repository has no buildable implementation on this branch")

    write_evidence(
        args.evidence,
        root=root,
        branch=args.branch,
        mode=args.mode,
        repository_class=args.repository_class,
        json_count=json_count,
        yaml_count=yaml_count,
        markdown_links=markdown_links,
    )
    print("RUNTIME_DEPLOYMENT_AUTHORIZED=NO")
    print("EXTERNAL_EFFECTS_AUTHORIZED=NO")
    print("REPOSITORY_VALIDATION=PASS")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValidationError as exc:
        print(f"REPOSITORY_VALIDATION_ERROR={exc}", file=sys.stderr)
        raise SystemExit(1)
