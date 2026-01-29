# Testing Guide

## Test Stack

- **Framework:** Vitest
- **DOM Environment:** jsdom
- **UI Testing:** @testing-library/svelte, @testing-library/dom, @testing-library/user-event
- **Coverage:** @vitest/coverage-istanbul

## Running Tests

```bash
npm run test          # Run all tests (watch mode by default)
npm run test:watch    # Explicit watch mode
npm run test:cov      # Run tests with Istanbul coverage report
```

## Test Structure

Tests live in `test/` mirroring the `src/` structure:

```
test/
├── setup.ts                  # Vitest setup file
├── __mocks__/
│   └── obsidian.ts           # Mock Obsidian API
└── **/*.test.ts              # Test files
```

Test files use the `.test.ts` extension.

## Configuration

`vitest.config.mts`:

- **Environment:** jsdom
- **Globals:** enabled (`describe`, `it`, `expect` available without imports)
- **Setup:** `test/setup.ts` runs before all tests
- **Path aliases:** `@` and `src` resolve to `src/`, `obsidian` resolves to the mock
- **Coverage exclusions:** node_modules, dist, `.d.ts` files, mocks, Svelte files, all of `src/ui/`

## Obsidian API Mocking

Since Obsidian's API is only available at runtime inside the app, all tests use the mock at `test/__mocks__/obsidian.ts`. The Vitest config aliases `obsidian` imports to this mock automatically.

## Writing New Tests

1. Create a test file in `test/` matching the source path (e.g., `test/data/repositories/RacesRepository.test.ts`)
2. Import from source using `src/` or `@/` path aliases
3. Use `describe`/`it`/`expect` (globally available)
4. Mock external dependencies as needed

### Example

```typescript
import { describe, it, expect } from 'vitest';
import { someFunction } from 'src/domain/utils/someUtil';

describe('someFunction', () => {
    it('should return expected result', () => {
        expect(someFunction('input')).toBe('expected');
    });
});
```

## Coverage

Coverage reports are generated in `coverage/` with text, HTML, and lcov formats. The following are excluded from coverage:

- `node_modules/`, `dist/`, `coverage/`
- Type definitions (`*.d.ts`)
- Mocks (`__mocks__/`)
- Svelte components (`src/**/*.svelte`)
- All UI code (`src/ui/**`)

## CI Integration

Tests run in GitHub Actions on push/PR to main, on Node.js 18.x and 20.x. The pipeline:

1. `npm ci`
2. `npm run svelte-check`
3. `npm test`
4. `npm run test:cov`
5. Upload coverage to Codecov
