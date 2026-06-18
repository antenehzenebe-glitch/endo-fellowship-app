#!/usr/bin/env python3
"""
patch_landing_video.py

Adds self-hosted HTML5 <video> support to components/Landing.tsx.
  - Inserts a directVideo() helper.
  - Rewrites VideoTile() to play .mp4/.webm/.ogg/.mov files natively.
  - YouTube / Vimeo embeds keep working exactly as before.

Safe to run:
  - Idempotent: detects if already patched and exits without changes.
  - Writes a .bak backup before modifying.
  - Aborts WITHOUT writing if it can't find its anchors (no half-edits).

Usage (from the repo root, in your Codespaces terminal):
    python3 patch_landing_video.py
Then review:
    git diff components/Landing.tsx
"""
import sys
from pathlib import Path

PATH = Path("components/Landing.tsx")

HELPER = """// A self-hosted video file (Supabase Storage, /public, or any direct URL) plays
// in a native HTML5 <video>. Returns the URL if it looks like a video file, else null.
function directVideo(src?: string): string | null {
  const s = (src ?? '').trim();
  if (!s) return null;
  return /\\.(mp4|webm|ogg|ogv|mov|m4v)(\\?|#|$)/i.test(s) ? s : null;
}

"""

NEW_VIDEOTILE = """function VideoTile({
  label,
  src,
  featured,
}: {
  label: string;
  src?: string;
  featured?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const file = directVideo(src);              // self-hosted file?
  const embed = file ? null : toEmbed(src);   // otherwise YouTube/Vimeo embed
  const ready = Boolean(file || embed);       // is there anything to play?

  return (
    <div className={'video16x9' + (featured ? ' video-featured' : '')}>
      {file && playing ? (
        <video
          src={file}
          title={label}
          controls
          autoPlay
          playsInline
          preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
        />
      ) : embed && playing ? (
        <iframe
          src={embed + (embed.includes('?') ? '&' : '?') + 'autoplay=1'}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          className={'video-ph' + (ready ? ' video-ready' : '')}
          onClick={() => ready && setPlaying(true)}
          disabled={!ready}
          aria-label={ready ? 'Play video: ' + label : label + ' \u2014 video coming soon'}
        >
          <span className="play" aria-hidden="true">
            <PlayIcon />
          </span>
          <span className="vlabel">{label}</span>
          <span className="vhint">{ready ? 'Tap to play' : 'Video coming soon'}</span>
        </button>
      )}
    </div>
  );
}"""


def fail(msg: str) -> None:
    print("ERROR: " + msg)
    print("No changes written.")
    sys.exit(1)


def main() -> None:
    if not PATH.exists():
        fail(f"{PATH} not found — run this from the repo root.")

    src = PATH.read_text(encoding="utf-8")
    original = src

    if "function directVideo" in src and "const file = directVideo(src)" in src:
        print("Already patched (directVideo + new VideoTile present). Nothing to do.")
        return

    # 1) Insert the directVideo helper immediately before Landing().
    if "function directVideo" not in src:
        anchor = "export default function Landing()"
        i = src.find(anchor)
        if i == -1:
            fail('could not find "export default function Landing()".')
        src = src[:i] + HELPER + src[i:]

    # 2) Replace VideoTile() — from its declaration up to the `const CSS =` block.
    vstart = src.find("function VideoTile({")
    if vstart == -1:
        fail('could not find "function VideoTile({".')
    css = src.find("const CSS =", vstart)
    if css == -1:
        fail('could not find "const CSS =" after VideoTile.')
    src = src[:vstart] + NEW_VIDEOTILE + "\n\n" + src[css:]

    # Backup, then write.
    backup = PATH.with_name(PATH.name + ".bak")
    backup.write_text(original, encoding="utf-8")
    PATH.write_text(src, encoding="utf-8")

    print(f"Patched   {PATH}")
    print(f"Backup    {backup}")
    print("Review    git diff components/Landing.tsx")
    print("Done.")


if __name__ == "__main__":
    main()
