#!/usr/bin/env python3
"""Purge expired episodic-memory files under ~/.pi/agent/episodes/.

Deterministic, no LLM. Run by a Hermes cron job (no_agent). Moves expired
episodes (expires_at in the past AND permanent != true) into .archive/, then
hard-deletes .archive/ entries older than 7 days. Prints what it archived so
the cron log records it; stays silent when there is nothing to do.
"""
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(os.environ.get("PI_CODING_AGENT_DIR") or Path.home() / ".pi" / "agent")
EPISODES = BASE / "episodes"
ARCHIVE = EPISODES / ".archive"
ARCHIVE_TTL_DAYS = 7

FM_RE = re.compile(r"^---\r?\n(?P<fm>[\s\S]*?)\r?\n---")


def parse_frontmatter(text: str) -> dict[str, str]:
    m = FM_RE.match(text)
    if not m:
        return {}
    data: dict[str, str] = {}
    for line in m.group("fm").splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            data[key.strip()] = value.strip().strip("'\"")
    return data


def is_expired(data: dict[str, str]) -> bool:
    if data.get("permanent") == "true":
        return False
    exp = data.get("expires_at")
    if not exp:
        return False
    try:
        expiry = datetime.strptime(exp, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return False
    return expiry < datetime.now(timezone.utc)


def purge() -> list[str]:
    EPISODES.mkdir(parents=True, exist_ok=True)
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    removed: list[str] = []
    now = datetime.now(timezone.utc)
    for path in EPISODES.glob("*.md"):
        if not is_expired(parse_frontmatter(path.read_text())):
            continue
        path.rename(ARCHIVE / path.name)
        removed.append(path.name)
    for path in ARCHIVE.glob("*.md"):
        age_days = (now - datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)).days
        if age_days > ARCHIVE_TTL_DAYS:
            path.unlink()
    return removed


if __name__ == "__main__":
    removed = purge()
    if removed:
        print("Archived expired episodes: " + ", ".join(removed))
    sys.exit(0)
