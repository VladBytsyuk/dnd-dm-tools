# Помощник ДМа Implementation Plan

## Work Packages

| ID | Task | Complexity | Completion |
| --- | --- | --- | --- |
| T1 | Add persisted Assistant workspace state and legacy migration | M | Assistant state preserves; standard state resets |
| T2 | Reduce panel hosts to metadata, mount, search, and resolve contracts | M | No feature registers an independent view |
| T3 | Register the sole Assistant view and ribbon entry | M | All routing opens Assistant tabs |
| T4 | Preserve tabs, split layout, global search, and accessibility | M | Existing workflows remain functional |
| T5 | Remove plugin settings and standard-only code | M | Only Assistant workspace persistence remains |
| T6 | Update tests, docs, and release validation | M | All quality gates pass |

## Verification

```bash
npm run svelte-check
npm run test -- --run
npm run test:cov
npm run build
git diff --check
```
