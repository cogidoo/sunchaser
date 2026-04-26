# Review Workflow

This project uses `oh-my-twin-agent.md` as the review rubric for architecture, implementation, tests, documentation, and accessibility.

## When To Stay In The Current Session

Stay in the current OpenCode session for:

- small implementation changes
- bug fixes with clear scope
- README or OpenSpec edits
- routine test/build fixes
- follow-up work after findings have already been triaged

## When To Open A New Session

Open a new session when the reviewer should be cold and independent:

- architecture review
- developer code review after a feature
- accessibility-focused review
- Codex or another model as a second opinion
- any review where implementation-history bias would be harmful

Use the prompts below as the starting message for those sessions.

## When To Use Subagents

Use subagents from the current session when multiple focused perspectives are useful and the results should be consolidated here:

- architect reviewer
- senior TypeScript/React reviewer
- test/accessibility reviewer

Subagents should review only. They should not implement fixes unless explicitly requested in a follow-up implementation task.

## Finding Triage

Use this decision table after reviews:

| Severity | Handling |
| --- | --- |
| Blocker | Fix before release or deployment. |
| Kritisch | Fix soon or explicitly document accepted risk. |
| Mittel | Create a GitHub issue or OpenSpec change if it needs design. |
| Klein | Batch with related cleanup; do not interrupt higher-priority work. |
| Hinweis | Keep only if it materially improves clarity or maintainability. |

Do not automatically implement every review suggestion. First classify it as:

- fix now
- GitHub issue
- OpenSpec change
- ignore

## Architecture Review Prompt

```text
Use `oh-my-twin-agent.md` as the review rubric.

Review the Sunchaser project as a senior architect.
Focus on requirements, constraints, assumptions, external service risks, static GitHub Pages deployment, OpenStreetMap/Overpass/Nominatim dependencies, data quality, maintainability, accessibility impact, and future extensibility.

Review:
- README.md
- AGENTS.md
- oh-my-twin-agent.md
- openspec/specs/sunset-alignment-map/spec.md
- openspec/changes/archive/2026-04-26-add-sunset-alignment-map/
- app/src/App.tsx
- app/src/lib/*
- .github/workflows/deploy.yml

Return findings only, ordered by severity:
Blocker, Kritisch, Mittel, Klein, Hinweis.

For each finding include:
- severity
- file/line reference if possible
- issue
- recommendation
- rationale

Do not implement anything.
Do not include generic praise.
Do not propose cosmetic changes unless they affect maintainability, accessibility, or correctness.
```

## Developer Review Prompt

```text
Use `oh-my-twin-agent.md` as the review rubric.

Review the Sunchaser implementation as a senior TypeScript/React developer.
Focus on correctness, edge cases, React lifecycle, MapLibre integration, async behavior, timeouts, external API failure handling, geometry math, segment merging, naming, testability, and maintainability.

Review:
- app/src/App.tsx
- app/src/lib/geocoding.ts
- app/src/lib/geometry.ts
- app/src/lib/overpass.ts
- app/src/lib/sun.ts
- app/src/lib/*.test.ts

Return actionable findings only, ordered by severity:
Blocker, Kritisch, Mittel, Klein, Hinweis.

Include file/line references.
Do not implement anything.
```

## Test And Accessibility Review Prompt

```text
Use `oh-my-twin-agent.md` as the review rubric.

Review tests and accessibility risks for Sunchaser.
Focus on behavior coverage, brittle tests, missing negative cases, keyboard navigation, focus visibility, semantic HTML, status messages, labels, color contrast, and WCAG/BITV relevance.

Review:
- app/src/App.tsx
- app/src/App.css
- app/src/index.css
- app/src/lib/*.test.ts

Return findings ordered by severity.
Suggest missing tests with rationale.
Do not implement anything.
```

## Recommended Review Sequence

For a completed feature:

1. Run the architecture review first.
2. Run the developer review second.
3. Run test/accessibility review if UI or critical logic changed.
4. Consolidate findings in the main session.
5. Create issues or OpenSpec changes for non-trivial follow-ups.
6. Implement only selected fixes.
