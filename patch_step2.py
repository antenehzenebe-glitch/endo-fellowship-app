#!/usr/bin/env python3
# Step 2 - wire ExternalHub into the dashboards and add the New Innovations
# header tab. Run from anywhere inside the repo:  python3 patch_step2.py
# Safe by construction:
#   - self-locates the git root
#   - aborts without writing ANYTHING if any anchor is missing/ambiguous
#   - skips an edit that is already applied (re-running is harmless)
import subprocess
import os
import sys

root = subprocess.check_output(['git', 'rev-parse', '--show-toplevel']).decode().strip()
os.chdir(root)

NI_HEADER = (
    '              <a\n'
    '                href={NEW_INNOVATIONS_URL}\n'
    '                target="_blank"\n'
    '                rel="noopener noreferrer"\n'
    '                aria-label="New Innovations (opens in a new tab)"\n'
    '                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors inline-flex items-center gap-1"\n'
    '              >\n'
    '                New Innovations\n'
    '                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">\n'
    '                  <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />\n'
    '                </svg>\n'
    '              </a>\n'
)

PASSWORD_LINK = (
    '              <Link\n'
    '                href="/account"\n'
    '                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"\n'
    '              >\n'
    '                Password\n'
    '              </Link>'
)

SIGNOUT_IMPORT = "import SignOutButton from '@/components/SignOutButton'\n"

pending = []


def once(text, sub, path, tag):
    n = text.count(sub)
    if n != 1:
        sys.exit(f"ABORT {path}: {tag} - expected exactly 1 match, found {n}. No files written.")


# ---- app/attending/page.tsx : imports + header tab + body hub ----
p = 'app/attending/page.tsx'
s = open(p, encoding='utf-8').read()
if 'ExternalHub' in s:
    print(f"skip   {p} (already wired)")
else:
    once(s, SIGNOUT_IMPORT, p, 'signout import')
    s = s.replace(
        SIGNOUT_IMPORT,
        SIGNOUT_IMPORT
        + "import ExternalHub from '@/components/ExternalHub'\n"
        + "import { NEW_INNOVATIONS_URL } from '@/lib/links'\n",
        1,
    )
    once(s, PASSWORD_LINK, p, 'password link')
    s = s.replace(PASSWORD_LINK, NI_HEADER + PASSWORD_LINK, 1)
    body_old = "          ))}\n        </div>\n      </main>"
    once(s, body_old, p, 'tiles/main anchor')
    s = s.replace(body_old, "          ))}\n        </div>\n\n        <ExternalHub />\n      </main>", 1)
    pending.append((p, s))
    print(f"queue  {p}")

# ---- app/dashboard/page.tsx : import + header tab (no hub) ----
p = 'app/dashboard/page.tsx'
s = open(p, encoding='utf-8').read()
if 'NEW_INNOVATIONS_URL' in s:
    print(f"skip   {p} (already wired)")
else:
    once(s, SIGNOUT_IMPORT, p, 'signout import')
    s = s.replace(SIGNOUT_IMPORT, SIGNOUT_IMPORT + "import { NEW_INNOVATIONS_URL } from '@/lib/links'\n", 1)
    once(s, PASSWORD_LINK, p, 'password link')
    s = s.replace(PASSWORD_LINK, NI_HEADER + PASSWORD_LINK, 1)
    pending.append((p, s))
    print(f"queue  {p}")

# ---- app/log/page.tsx : import + body hub ----
p = 'app/log/page.tsx'
s = open(p, encoding='utf-8').read()
if 'ExternalHub' in s:
    print(f"skip   {p} (already wired)")
else:
    log_import = "import { ProcedureLogger, type Progress, type RecentLog } from '@/procedures/ProcedureLogger'\n"
    once(s, log_import, p, 'logger import')
    s = s.replace(log_import, log_import + "import ExternalHub from '@/components/ExternalHub'\n", 1)
    logger_old = (
        '        <ProcedureLogger\n'
        '          progress={progress}\n'
        '          attendings={attendings}\n'
        '          logs={recent}\n'
        '          todayStr={new Date().toISOString().slice(0, 10)}\n'
        '        />\n'
        '      </main>'
    )
    once(s, logger_old, p, 'logger/main anchor')
    s = s.replace(logger_old, logger_old.replace('        />\n      </main>', '        />\n        <ExternalHub />\n      </main>'), 1)
    pending.append((p, s))
    print(f"queue  {p}")

# all anchors matched - commit to disk
for path, content in pending:
    open(path, 'w', encoding='utf-8').write(content)
    print(f"WROTE  {path}")

if not pending:
    print("nothing to do - everything already wired.")
