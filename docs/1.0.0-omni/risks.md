# Помощник ДМа Risk Register

| ID | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| R-001 | Legacy standard leaves remain unresolved | High | Detect legacy standard data and detach all legacy IDs |
| R-002 | Existing Assistant layouts are lost | High | Preserve legacy `omniWorkspace` data during migration |
| R-003 | Panel mounts leak after tab changes | High | Keep explicit Svelte unmount ownership |
| R-004 | Cross-feature links bypass the Assistant | High | Route feature, tracker, processor, and search opens through one manager |
| R-005 | Global search is slow or partially fails | Medium | Debounce, parallel settled queries, and stale-response guards |
| R-006 | Tab movement is inaccessible | Medium | Maintain button-based reorder and cross-tile movement |
