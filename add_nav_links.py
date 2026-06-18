#!/usr/bin/env python3
"""
add_nav_links.py

Adds "Emergencies" and "Schedule" nav links to BOTH places fellows and staff
navigate from:
  - app/dashboard/page.tsx  (staff dashboard — navy header)
  - app/log/page.tsx        (fellow logger — white/gray header)

It inserts the two links just before the existing "Password" link, and it copies
the className from that Password link, so each file automatically gets the right
style (you don't have to think about navy vs gray). Single-line and multi-line
<Link> formats are both handled.

Safe to run:
  - Idempotent per file: if a file already has the Emergencies link, it's skipped.
  - Writes a .bak backup of each file it changes.
  - Never half-edits: if a file is missing or has no anchor, that file is skipped
    with a message and nothing is written for it.

Usage (from the repo root, in your Codespaces terminal):
    python3 add_nav_links.py
Then review:
    git diff app/dashboard/page.tsx app/log/page.tsx
"""
import re
from pathlib import Path

FILES = [Path("app/dashboard/page.tsx"), Path("app/log/page.tsx")]
NEW_LINKS = [("/emergencies", "Emergencies"), ("/schedule", "Schedule")]


def build_block(href: str, label: str, indent: str, class_name: str, single_line: bool) -> str:
    if single_line:
        return f'{indent}<Link href="{href}" className="{class_name}">{label}</Link>\n'
    inner = indent + "  "
    return (
        f"{indent}<Link\n"
        f'{inner}href="{href}"\n'
        f'{inner}className="{class_name}"\n'
        f"{indent}>\n"
        f"{inner}{label}\n"
        f"{indent}</Link>\n"
    )


def patch_file(path: Path) -> str:
    if not path.exists():
        return f"skip — {path} not found"

    src = path.read_text(encoding="utf-8")
    if 'href="/emergencies"' in src:
        return f"skip — {path} already has the Emergencies link"

    idx = src.find('href="/account"')
    if idx == -1:
        return f"skip — {path}: could not find the Password link (href=\"/account\")"

    # The <Link> ... </Link> that owns this href.
    link_open = src.rfind("<Link", 0, idx)
    link_close = src.find("</Link>", idx)
    if link_open == -1 or link_close == -1:
        return f"skip — {path}: could not bound the Password <Link> element"
    block = src[link_open : link_close + len("</Link>")]

    cls_m = re.search(r'className="([^"]*)"', block)
    if not cls_m:
        return f"skip — {path}: Password link has no className to copy"
    class_name = cls_m.group(1)
    single_line = "\n" not in block

    # Indentation = whitespace before <Link on its line.
    line_start = src.rfind("\n", 0, link_open) + 1
    indent = src[line_start:link_open]

    insertion = "".join(
        build_block(href, label, indent, class_name, single_line) for href, label in NEW_LINKS
    )
    new_src = src[:line_start] + insertion + src[line_start:]

    backup = path.with_name(path.name + ".bak")
    backup.write_text(src, encoding="utf-8")
    path.write_text(new_src, encoding="utf-8")
    return f"patched — {path} (backup {backup})"


def main() -> None:
    for f in FILES:
        print(patch_file(f))
    print("Review with: git diff app/dashboard/page.tsx app/log/page.tsx")


if __name__ == "__main__":
    main()
