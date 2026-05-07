---
name: dnd-svelte-refactor
description: Review and refactor a single Svelte component in the dnd-dm-tools Obsidian plugin. Use when asked to simplify, reduce complexity, remove unnecessary code, or clean up a specific *.svelte file while preserving behavior and component contract. Requires review first, Plan Mode analysis before edits, Svelte 5 rune awareness, local-only changes, and no git commands.
---

# DnD Svelte Refactor

Refactor one specified `*.svelte` file in this project after a deep review and a decision-complete plan. Behavior preservation is the first priority.

## Required Input

Require exactly one target component path or filename ending in `.svelte`.

- If the user gives only a basename, locate it with `rg --files -g '*.svelte'` and proceed only if there is a single match.
- If there are multiple matches or no match, ask for the exact path.
- Do not broaden scope to other files unless a supporting change is explicitly planned and necessary to preserve behavior.

## Review First

Before editing, analyze the target file and relevant local context:

- Read the whole target file.
- Inspect imports, referenced types/controllers/stores/helpers, sibling components, and relevant tests.
- Inspect callers only when needed to understand props, events, snippets/slots, class hooks, or expected DOM behavior.
- Look for unnecessary state, redundant derived values, repeated markup, over-broad effects, dead branches, needless handlers, duplicated formatting logic, fragile reactivity, and Svelte 5 rune misuse.

Report review findings before proposing changes. Focus on concrete simplification opportunities and behavior-preservation risks, not style preferences.

## Plan Mode Gate

Use Plan Mode for the analysis and planning phase when the environment supports it.

- Produce a single `<proposed_plan>` before any edits.
- Make the plan decision complete: target file, intended simplifications, preserved contract, validation commands, and any intentionally untouched behavior.
- If still in Plan Mode, stop after the plan. Implement only after the user exits Plan Mode or explicitly requests execution in a non-Plan mode.

## Refactor Rules

Preserve the component contract and observable behavior.

- Do not change prop names, prop types, exported bindings, callbacks, event semantics, snippets/slots, public CSS class hooks, Russian UI text, data flow, or user-visible behavior.
- Keep Svelte 5 rune conventions: use `$state`, `$derived`, `$effect`, and `$effect.pre` appropriately; do not capture changing `$props()` values in stale top-level constants.
- Prefer smaller local helpers only when they remove meaningful duplication or make reactive behavior clearer.
- Remove code only after proving it is unreachable, redundant, or semantically duplicated.
- Avoid speculative redesigns, visual restyling, component extraction, dependency changes, and unrelated cleanup.
- Keep edits local and minimal. Use `apply_patch` for manual edits.

## Prohibited Actions

Do not use git for this workflow.

- Do not run `git status`, `git diff`, `git show`, `git add`, `git checkout`, `git reset`, or any other git command.
- Do not change generated release artifacts.
- Do not rewrite unrelated files.

## Verification

After implementation:

- Run `npm run svelte-check`.
- Run focused tests when the target has relevant tests or touched behavior has a testable controller/helper boundary.
- If validation cannot run, state exactly why.

In the final response, summarize the review-driven refactor, list changed files, and report validation results.
