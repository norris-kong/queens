"""Merges each glyph's overlapping pieces into a single outline.

Cherry Bomb One draws many letters from overlapping pieces (B is a stem and two bowls). Outlining a
letter along both sides of its edge, as Level lettering does (src/ui/Lettering.tsx), would trace
those seams inside the letter; with the pieces merged, only the letter's real edge is outlined.

Run after changing the font, from the repository root:
    python3 -m venv .venv-font && .venv-font/bin/pip install fonttools brotli skia-pathops
    .venv-font/bin/python tools/mergeFontOverlaps.py
"""

import sys

from fontTools.ttLib import TTFont
from fontTools.ttLib.removeOverlaps import removeOverlaps

SOURCE = "node_modules/@fontsource/cherry-bomb-one/files/cherry-bomb-one-latin-400-normal.woff2"
TARGET = "src/assets/fonts/cherry-bomb-one-merged-latin.woff2"


def main() -> None:
    font = TTFont(SOURCE)
    removeOverlaps(font)
    font.flavor = "woff2"
    font.save(TARGET)
    print(f"Wrote {TARGET}")


if __name__ == "__main__":
    try:
        main()
    except OSError as error:
        sys.exit(f"Could not merge the font: {error}")
