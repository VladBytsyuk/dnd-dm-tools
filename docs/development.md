# Development Setup

## Prerequisites

- **Node.js** 18.x or 20.x
- **npm** (bundled with Node.js)
- An Obsidian vault for testing

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd dnd-dm-tools

# Install dependencies
npm install

# Start development build with watch mode
npm run dev
```

For local testing, symlink or copy the plugin into your Obsidian vault's `.obsidian/plugins/dnd-dm-tools/` directory.

## Build Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Development build with file watching (copies WASM, runs esbuild) |
| `npm run build` | Production build with TypeScript type checking |
| `npm run release` | Build and copy artifacts to `.release/dnd-dm-tools/` |
| `npm run test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage report |
| `npm run svelte-check` | Run Svelte type checking |

## Build Output

The build produces:

| File | Description |
|------|-------------|
| `main.js` | Bundled and minified plugin code |
| `manifest.json` | Obsidian plugin manifest |
| `styles.css` | Plugin styles |
| `sql-wasm.wasm` | SQLite WebAssembly binary (copied from `node_modules/sql.js/dist/`) |

Release builds copy these to `.release/dnd-dm-tools/`.

## Project Structure

```
dnd-dm-tools/
├── src/                    # Source code (see architecture.md)
│   ├── main.ts             # Plugin entry point
│   ├── domain/             # Business logic, models, interfaces
│   ├── data/               # Database, DAOs, repositories
│   │   └── database/       # DB manager and DAO implementations
│   ├── ui/                 # UI components and Svelte layouts
│   └── assets/data/        # TypeScript data imports
├── data/                   # JSON data files (D&D 5e content)
├── test/                   # Test suite (see testing.md)
├── docs/                   # Developer documentation
├── .github/workflows/      # CI/CD configuration
├── package.json
├── tsconfig.json
├── vitest.config.mts
└── esbuild.config.mjs
```

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | 5.9 | Language |
| Svelte | 5.38 | UI framework |
| Obsidian API | latest | Plugin host |
| SQL.js | 1.13 | In-memory SQLite via WASM |
| esbuild | 0.25 | Bundler |
| esbuild-svelte | 0.9 | Svelte plugin for esbuild |
| Vitest | 1.6 | Test framework |
| lucide-svelte | 0.477 | Icon library |
| yaml | 2.7 | YAML parsing |

## Path Aliases

Configured in `tsconfig.json` and `vitest.config.mts`:

- `@/*` → `src/*`
- `src/*` → `src/*`

## CI/CD

GitHub Actions (`.github/workflows/test.yml`) runs on push/PR to `main`:

1. Checkout code
2. Setup Node.js (matrix: 18.x, 20.x)
3. `npm ci`
4. `npm run svelte-check`
5. `npm test`
6. `npm run test:cov`
7. Upload coverage to Codecov

## Notes

- Plugin UI text is in Russian
- The plugin uses Svelte 5 runes syntax
