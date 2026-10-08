# flipp Work Ledger

### Your work, quietly moving.

A proposed private work ledger for an assistant and its owner. One place to see what is happening, what needs attention, and what comes next.

**Status: design and synthetic prototypes.** The ledger, backend, authentication, MCP Events integration, and A2UI adapter are not implemented or deployed. Implementation quality gates are NOT RUN.

[Product requirements](docs/PRD.md) · [Design preview](mockups/README.md) · [Implementation roadmap](https://github.com/ptw1255/flipp-work-ledger/issues/1)

## Why flipp

Work discussed in chat can outlast the conversation: a dependency is pending, a check is due, a result needs verification, or a decision is blocked. flipp is designed to give that work durable state and a clear next step, while keeping decisions in the existing chat.

The owner should not need to inspect leases, revision numbers, receipts, or an agent's coordination payload to understand their work.

## A quiet view of the work

The chosen direction is a compact, continuous list with Apple-inspired restraint. Each row shows only the task title and a meaningful status. Opening a row reveals its update and next step; evidence and history sit behind a second disclosure. Canceled work and uncertain outcomes remain explicit. The full agent contract stays separate from the human surface.

**Desktop · synthetic design reference**

![flipp textured-white list desktop prototype](https://raw.githubusercontent.com/ptw1255/flipp-work-ledger/930ae7933b9ba5cea8da73a36b33288cee333b16/mockups/screenshots/variant-a-desktop.png)

<details>
<summary>Mobile preview</summary>

<p>Canonical columns stack in the same order, with a state jump and Details expanding within each card. Synthetic data only.</p>
<img src="https://raw.githubusercontent.com/ptw1255/flipp-work-ledger/930ae7933b9ba5cea8da73a36b33288cee333b16/mockups/screenshots/variant-a-mobile.png" width="390" alt="Compact mobile task list with expandable details">

</details>

These are static interactive mockups, not a live product or verified A2UI integration. The pinned iteration is the implementation reference; future design revisions remain reviewable. [Open list source](mockups/variant-a-ledger.html) · [Expanded mobile Details](mockups/screenshots/variant-a-mobile-detail.png) · [Visual acceptance criteria](docs/IMPLEMENTATION_PLAN.md#pinned-visual-reference). Variant B is retained for comparison. The list has no state-changing controls; decisions stay coordinated in chat. Reduced transparency uses a solid-white surface.

## What the MVP is designed to do

| Need | Proposed behavior |
| --- | --- |
| Know what is happening | Canonical Queued, Running, Waiting externally, Blocked, Completed, and Canceled states |
| Know what happens next | Named next step, responsible actor, due time or next check |
| Trust a result | Attributable, revision-consistent evidence; evidence age separate from view freshness |
| Keep waiting work visible | Durable check scheduling, attention events, and explicit missed-check/delivery failures |
| Recover safely | Versioned writes, receipts, leased claims, cancellation, and read-only uncertain-outcome reconciliation |
| Keep the surface simple | A minimal human board/card projection with deeper coordination data available to the authenticated agent |

These are product requirements, not shipped features. Cancellation cannot undo an external action, and a callback receipt cannot prove work started or completed.

## How work would flow

1. The owner discusses an outcome, scope, and decisions with the assistant in chat.
2. The assistant records authorized work in the ledger.
3. Eligible work or a due check creates a minimal attention event.
4. The assistant fetches current state, checks authority, and uses its existing authorized tools to perform the work.
5. The assistant records observations and verifies the result. The owner sees a concise card update with evidence available through Details.

The first technical gate is a real authenticated MCP Events loop: event → intended conversation → current-task fetch. Official platform support alone is not proof that this client and deployment work. [Connectivity gate](docs/IMPLEMENTATION_PLAN.md#g1--authenticated-real-client-connectivity-spike)

## Human clarity. Agent context.

| Owner | Assistant | Ledger |
| --- | --- | --- |
| Reads the board, inspects Details, discusses decisions in chat | Checks authority, chooses its Mac/cloud/tools, performs work, verifies external outcomes | Coordinates state, timing, ownership, revisions, and evidence |

The agent payload includes canonical versions, scope and approval references, claims/fences, dependencies, due checks, cancellation, evidence, and recovery context. The human browser receives a smaller authorized projection. Hidden UI is not access control: agent metadata must stay server-side, not be sent to the browser and hidden with CSS.

[Normative payload contract](docs/PRD.md#agent-and-human-payload-contract) · [Synthetic agent example](mockups/agent-payload.example.json)

## Private by design

The public repository contains generic design and synthetic examples. Runtime task data is intended to be private.

- Source messages, inbox bodies, attachments, contact records, external-service credentials, and signed URLs stay outside ledger records and public fixtures.
- Owner and principal identity derive from server authentication; every view and command is scoped.
- Events carry minimal IDs, versions, and reasons. The assistant must fetch current state before acting.
- Cancellation, uncertainty, revocation, deletion, and quarantined restore are explicit release requirements.

No deployment, new persistent access, spending limit, private-data admission, or broad production rollout is authorized by these documents.

## Proposed technical shape

A modular monolith: a Cloudflare-oriented Worker edge with one canonical transactional store, internal domain/policy/scheduler/outbox modules, authenticated MCP queries and commands, and a private read-mostly kanban view. A future bounded A2UI adapter consumes a deterministic human projection using host-controlled components and presentation-only actions.

The ledger coordinates work; the assistant owns external execution. Exact runtime, client, renderer versions, deployment target, retention, capacity, and budget remain decisions to resolve. No zero-cost guarantee or assistant-start SLA is claimed.

## Build with quality gates

The [linked implementation roadmap](https://github.com/ptw1255/flipp-work-ledger/issues/1) contains 16 ordered work items. Every issue names dependencies, scope, requirements, acceptance checks, proof artifacts, approval stops, and recovery.

Contracts and the real-client connectivity gate come first. Canonical state, scheduling/recovery, privacy, and UI follow. A whole-system synthetic pilot must pass before explicit private-pilot approval. Creating this backlog does not start implementation or assign agents.

## Product and engineering documents

| Document | Purpose |
| --- | --- |
| [PRD](docs/PRD.md) | Product scope, owner experience, normative payload contract, acceptance |
| [Constraint matrix](docs/CONSTRAINTS.md) | C01–C16 boundaries and required proof |
| [System design](docs/SYSTEM_DESIGN.md) | Modules, canonical data, commands, recovery, trust boundaries |
| [UI experience](docs/AGENT_UI_EXPERIENCE.md) | Minimal kanban, deterministic lenses, evidence and agent boundary |
| [Implementation plan](docs/IMPLEMENTATION_PLAN.md) | G0–G7 sequence, quality gates, CI lanes, evidence template, MVP done |
| [Mockups](mockups/README.md) | Interactive static directions and desktop/mobile review images |
| [GitHub roadmap](https://github.com/ptw1255/flipp-work-ledger/issues/1) | Dependency-linked issues for future implementation |
