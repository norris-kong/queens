# Queens

A logic puzzle in the style of LinkedIn Queens: place one Queen in every row, column and colour
Region, with no two Queens touching. Terms are defined in [CONTEXT.md](CONTEXT.md); decisions are
recorded in [docs/adr](docs/adr).

## Develop

```sh
pnpm install
pnpm dev          # game at http://localhost:5173, editor at #/editor
pnpm test         # unit tests (Vitest)
pnpm coverage     # unit tests with the 80% coverage gate
pnpm e2e          # Playwright flows against the production build
pnpm build        # type-check and build to dist/
```

## Puzzles

Each Puzzle is a file `puzzles/<size>/<name>.txt`, such as `puzzles/04/Beginner 1.txt`: one line
per row, one letter (A–L) per Cell naming its Region. Names may use letters, digits, `-`, `_` and
single spaces, and must differ within a Size even ignoring case. Players never see the name: the
list groups Puzzles under each Size's Level (4 Beginner … 12 Master) and shows only their number.
Every file must be a valid Puzzle (N×N, N connected Regions, exactly one Solution) and distinct;
`pnpm test` fails otherwise.

Make and edit Puzzles in the editor at `#/editor`, which only exists under `pnpm dev`. It checks the
Draft as you paint, shows two diverging Solutions when there is more than one, and writes the file
when you save. **自動出題** fills the Draft with a generated Puzzle of the chosen Size (evenly sized
Regions, exactly one Solution) that you can adjust and save. A new Puzzle is named after its Level
and the next number, e.g. `Beginner 11`; you can still type another name. Once saved, a Puzzle opens
for corrections and is never generated over: **＋ 新增下一題** starts the next one at the same Size,
ready for another **自動出題**.

### Level art

The home page opens each Level from a picture button, and a Level's page numbers its Puzzles on
badges; on the Board, a Queen is drawn as the logo of its Size's Level, and the logos grow and settle
back when the Puzzle is Solved. The drawings live in `buttons/`; `pnpm art:levels` resizes them and
writes the WebP files the game ships to `src/assets/levels/`. Level names and numbers are lettered
in Cherry Bomb One, with each Level's colours set in `src/ui/levelArt.ts`.

### Board look

No Board asks players to tell Regions apart by colour alone, so colour-blind players can play. The
game's own Puzzles set each Cell as a jelly sweet in its Region's colour: a rounded tile, thick along
its bottom and shining along its top edge, in a tray of a deeper shade. Each Region is rimmed in its
own deepest shade, dark enough to see by lightness alone, and the Board is ringed in its Level's
colours. LinkedIn Puzzles keep LinkedIn's look: its colours on flat Cells, a thin line between every
pair, and thick black lines between Regions. Both palettes live in `src/config.ts`;
`src/ui/regionTones.ts` works out the deeper shades, `src/ui/regionRims.ts` where the rims run, and
`src/ui/look.ts` which look uses what.

### Daily Puzzles

The home page opens with the Daily Puzzle: one Puzzle a day, the same for every player, changing at
midnight Hong Kong time. Its Size grows through the week, from 6 on Monday to 12 on Sunday. A
calendar from the first day (`DAILY_FIRST_DATE` in `src/config.ts`) up to today lets players catch up
on missed days. Daily Puzzles are not files: each is generated in the browser from its date (ADR
0002), so changing the generator changes them.

### Nightmare

After Master comes Nightmare, an endless run of Stages: solving one generates the next. Stages 1–5
are Size 6, and every five Stages add one, up to Size 12 from Stage 31 on. Every player's Stage N is
the same Puzzle, generated from its number like the Daily Puzzles; players only move forward, and
only the Stage reached is kept, in the browser.

### LinkedIn Puzzles

`puzzles/LinkedIn/<number>.txt` holds LinkedIn Queens puzzles under LinkedIn's own numbers, listed
on their own page and credited there. They come from community archives: first
[archivedqueens.com](https://www.archivedqueens.com/), then [awa.games](https://awa.games/linkedin-queens/)
(also at linkedinzip.solutions), which has every puzzle from #1. `pnpm import:linkedin` downloads
awa.games's archive and adds the numbers still missing; it never overwrites a stored puzzle, only
reports one the archive draws differently. LinkedIn has rerun some puzzles, so a layout can appear
under several numbers; being the same Puzzle, they share progress. The puzzles are LinkedIn's; this
project is not affiliated with LinkedIn or Microsoft.

To add the day's LinkedIn puzzle, set **存到** to **LinkedIn** in the editor, enter LinkedIn's number
(the editor offers the one after the latest stored), paint the Regions and save; it is written to
`puzzles/LinkedIn/<number>.txt`. Stored LinkedIn Puzzles are listed under LinkedIn in the editor's
sidebar to correct, renumber or delete. A layout already in the library, LinkedIn or the author's
own, is refused either way. LinkedIn #336, its April Fools' puzzle of 2025, is the one Puzzle whose
Regions may be split into parts that do not touch (`linkedInRules` in `src/core/linkedInCatalog.ts`).

## Deploy

Pushing to `main` runs lint, unit tests, E2E and the build in GitHub Actions, then publishes `dist/`
to GitHub Pages. Enable Pages with "GitHub Actions" as the source in the repository settings.
