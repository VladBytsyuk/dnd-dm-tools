# Omni Mode Risk Register

| ID | Risk | Probability | Impact | Severity | Owner | Mitigation | Residual |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | Runtime view/ribbon lifecycle leaves stale UI | Medium | High | High | Frontend | Keep view registration static; centrally rebuild ribbons and detach incompatible leaves | Medium |
| R-002 | Existing users are misclassified as fresh installs | Low | High | High | Tech Lead | Detect existing database before defaults; add upgrade tests and document fallback | Low |
| R-003 | Mounted Svelte panels leak or lose state | Medium | High | High | Frontend | Explicit unmount ownership and keyed tab hosts; lifecycle tests | Medium |
| R-004 | Global search is slow across repositories | Medium | Medium | Medium | Frontend | Debounce, parallel settled queries, result limits, stale-request guard | Low |
| R-005 | Drag-and-drop is inaccessible or unreliable on mobile | High | Medium | High | Frontend/QA | Provide keyboard/menu movement as a first-class path | Medium |
| R-006 | Custom tracker/character panels do not fit generic hosting | Medium | High | High | Frontend | Host-neutral mount descriptors and focused manual regression tests | Medium |
| R-007 | Cross-feature links bypass mode routing | Medium | High | High | Tech Lead | One router used by features, processors, tracker, and search | Low |
| R-008 | Persisted state contains removed/duplicate panel keys | Medium | Medium | Medium | Frontend | Normalize on every load and save | Low |
| R-009 | Split panels become unusable at small heights | Medium | Medium | Medium | UI/QA | Independent scrolling, minimum content treatment, narrow-height tests | Medium |

## Governance

- High risks are reviewed at each integration checkpoint.
- R-001, R-002, R-003, R-006, and R-007 block the 1.0.0 release until mitigations are verified.
- Any discovered database integrity issue is escalated to Critical and stops release preparation.

