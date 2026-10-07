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
and the next number, e.g. `Beginner 11`; you can still type another name.

## Deploy

Pushing to `main` runs lint, unit tests, E2E and the build in GitHub Actions, then publishes `dist/`
to GitHub Pages. Enable Pages with "GitHub Actions" as the source in the repository settings.
