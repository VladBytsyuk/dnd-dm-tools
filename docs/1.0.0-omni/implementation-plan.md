# Omni Mode Implementation Plan

## Work Packages

| ID | Task | Owner | Dependencies | Complexity | Completion |
| --- | --- | --- | --- | --- | --- |
| T1 | Add settings models, defaults, normalization, persistence, and settings tab | Frontend | None | M | Fresh/upgrade defaults and immediate save are tested |
| T2 | Define panel keys/descriptors and adapt all panels | Tech Lead/Frontend | T1 | L | All 13 panels expose one host-neutral contract |
| T3 | Add centralized panel/item routing | Frontend | T2 | M | Links route correctly in both modes |
| T4 | Add Separate ribbon lifecycle and panel toggles | Frontend | T1-T3 | M | Ribbon visibility follows settings |
| T5 | Add Omni ItemView, picker, tabs, and single layout | Frontend | T2-T3 | L | Empty state and tab lifecycle work |
| T6 | Add split layout, movement, accessibility, and persistence | Frontend | T5 | L | State restores and operations are keyboard accessible |
| T7 | Add global search and result routing | Frontend/Data | T2-T6 | L | Search is grouped, failure-isolated, and race-safe |
| T8 | Reconcile mode changes and startup workspace | Frontend | T4-T7 | M | Switching is immediate and deterministic |
| T9 | Add automated and manual validation | QA/Frontend | T1-T8 | L | Release gates pass |
| T10 | Update 1.0.0 metadata and release notes | Documentation | T9 | S | Release artifacts identify 1.0.0 |

## Delivery Sequence

1. Establish settings and stable contracts.
2. Move existing view opening behind the router.
3. Complete Separate behavior before adding Omni.
4. Deliver Omni incrementally: empty state, tabs, split, persistence, search.
5. Validate upgrade behavior and existing feature regressions.
6. Update release metadata only after implementation gates pass.

## Integration Checkpoints

- After T3: every cross-feature link opens through the router.
- After T5: every panel can mount inside Omni.
- After T7: global search can open every searchable entity type.
- After T8: no incompatible plugin leaves remain after mode changes.

## Verification Commands

```bash
npm run svelte-check
npm run test -- --run
npm run test:cov
npm run build
```

