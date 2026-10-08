# flipp Work Ledger agent-driven UI experience

Version 0.2 · 8 October 2026 · For review

## Purpose and status

This document specifies how flipp may choose what ledger information to surface as work progresses. It is a presentation policy over authenticated canonical state, not a new assistant persona, a chat interface, an execution engine, or authority to perform work.

The static mockups demonstrate layout directions only. A2UI is a desired future adapter and is not implemented. All UI release requirements remain governed by [C16](CONSTRAINTS.md#c16).

## Evidence task

The owner should be able to answer, within one view:

1. What needs my attention, and why?
2. What is progressing without intervention?
3. What is waiting, until when, and on what?
4. What changed, what evidence supports it, and how fresh is that evidence?

The surface should support those questions without invented priority scores, decorative metrics, or a requirement to converse with another on-screen agent.

## Stable layout contract

The page keeps four stable regions even as work changes:

1. **Context bar:** quiet product name and view update time.
2. **Presentation controls:** a small view switcher, search, and reset.
3. **Action cards:** title, plain-language state, next step, and relevant time.
4. **Progressive disclosure:** explanation, scope, evidence, and history expand inside the card without replacing the page.

The human surface answers what happened, whether the owner needs to act, and what happens next. It uses system typography, generous spacing, neutral surfaces, few borders, and small orange attention cues. No raw IDs, leases, revision numbers, payloads, audit tables, or repeated freshness labels appear by default.

Blockers, missed checks, and uncertain outcomes remain explicit on the card face. Scope, evidence observation time, and chronology are available in Details. A stale projection warning is always visible when applicable; a fresh page cannot imply fresh evidence. Human-friendly labels are deterministic mappings and never overwrite canonical state.

### Separate agent payload

An authenticated agent query returns a versioned coordination payload containing canonical state and revision, scope and completion revisions, approval references, ownership and claim validity, dependencies, due times, next check, action constraints, evidence references and observation times, delivery health, audit sequence, projection time, and missing-field warnings. The agent uses this payload to inspect and coordinate work. The human renderer receives a smaller presentation projection.

These are distinct authorized query contracts, not two stores. Hiding content in a card is a presentation choice, not a security boundary. Server authorization and owner-scoped MCP queries enforce access. Private agent payloads are not embedded in HTML, returned through A2UI action context, or placed in client source. The static prototypes use public synthetic fixtures only. [Example agent payload](../mockups/agent-payload.example.json) illustrates the contract and explicitly marks unknown fields; it is not a backend endpoint.

Desktop may place the work index beside inspection. Mobile stacks the same regions in the same reading order. State changes update labels, qualifiers, next action, and chronology within those regions; they do not replace the whole application shell, open a surprise modal, or move essential evidence to a new location.

## Canonical lenses

flipp may propose one of three default lenses from the canonical projection. The owner can always change or reset it.

| Lens | Inclusion rule | Ordering rule | What must remain visible |
| --- | --- | --- | --- |
| **Needs attention** | Blocked tasks; canceled tasks with uncertain outcomes; missed checks; expired claims; terminal delivery failures; explicit owner decisions; eligible work whose approved start is overdue | Consequence class first, then oldest due time, then stable task ID | Exact reason, who or what can resolve it, next action, canonical state, evidence age |
| **Progressing** | Running tasks with valid claims; recently eligible or newly started tasks; tasks with a recent task check and an expected next step | Most recent meaningful transition, then next deadline | Claim validity, actual start milestone, current step, next action, last task check |
| **Waiting** | Waiting externally with a future check or active subscription; queued work not yet eligible | Earliest next check or eligibility time | Dependency, last observation, next check, stopping condition, subscription or schedule health |

Completed work is available through state filters and history but does not displace unresolved work in the default lens. Canceled work appears in Needs attention only when an external outcome remains uncertain or read-only reconciliation is overdue.

The selection rule is deterministic. If any task satisfies Needs attention, that lens is proposed. Otherwise use Progressing when work is active, then Waiting. If none apply, show the full ledger with an explicit quiet state. flipp may explain the proposal using canonical reason codes; it cannot invent “urgent,” “high priority,” confidence, or percentages.

## State-driven presentation

| Canonical transition | Row and detail changes | Attention behavior | What must not happen |
| --- | --- | --- | --- |
| Created → Queued | Show eligibility time, scope, and next action | Surface only if eligible now and its expected start is overdue | Do not label as started or running |
| Queued → Running | Add actual start, valid lease summary, current step, and claim expiry | Move to Progressing unless the claim is stale | A claim alone cannot imply the attempt started |
| Running → Waiting externally | Replace current step with named dependency, last observation, next check, or subscription | Move to Waiting until a check is missed or delivery fails | Do not infer external completion from silence |
| Any nonterminal → Blocked | Add blocker reason, resolver, and smallest next step | Move to Needs attention | Never hide the blocker behind a generic status summary |
| Running → Completed | Add completion time and attributable, revision-consistent evidence | Remove from default unresolved work | Do not equate callback receipt, claim, or response text with completion |
| Any nonterminal → Canceled | Preserve cancellation time and disable future-work cues | Surface only if external outcome is uncertain or reconciliation is due | Do not imply rollback, retry, or reopened execution |
| Claim expires | Keep canonical state honest and add `Expired claim` qualifier plus recovery next step | Move to Needs attention | Do not call the external action failed |
| Check is missed | Keep Waiting externally and add `Missed check` with duration | Move to Needs attention | Do not invent agent or Mac connectivity state |

The inspection surface includes a compact state path derived from audit history so two or three material transitions are visible without animation or layout replacement.

## Evidence and freshness binding

Every status-bearing component binds to canonical fields or a documented deterministic derivation:

- canonical state and record version;
- qualifier reason code and its observed or due time;
- next action and resolver;
- current scope and completion revisions;
- evidence author, reference kind, and `observed_at`;
- last recorded task check;
- projection source sequence and `projected_at`.

`observed_at` and `projected_at` are displayed separately. Page freshness cannot make old evidence look current. A renderer cannot suppress a blocker, stale claim, missed check, uncertain outcome, or projection warning even when space is constrained.

## Agent-to-UI generation boundary

The host asks the adapter for a surface only after authentication, authorization, canonical query, and deterministic view-model construction. flipp may choose an allowed layout composition and the proposed canonical lens. It may not add facts, free-form instructions, action permissions, status semantics, or unapproved urgency.

The host-controlled catalog permits only approved ledger components and read-only presentation actions. Both agent and client validate version, schema, component references, enum values, collection sizes, depth, string lengths, and payload bytes. Invalid output renders the safe canonical text fallback with state, blocker, next action, evidence observation time, and page projection time intact.

Set `sendDataModel: false`. Action context is minimal and allowlisted: opaque task ID, enumerated filter, enumerated sort, or approved view name. No source bodies, credentials, signed URLs, private contacts, full data model, mutation commands, external work, or environment controls are present.

MCP Events remains the wake path. A2UI changes presentation only after a current authenticated fetch; it does not create attention, authorize work, or prove progress.

## Prototype directions

### A · Compact ledger

The selected direction: one compact card per action, on a subtle textured neutral background. Two columns on desktop become one on mobile. Card faces carry only the information needed to understand the work and next step; Details expands explanation and evidence. Technical agent metadata stays outside the human surface.

### B · Attention and chronology

Best for reviewing exceptions one at a time. A quiet attention queue sits beside a spacious selected update. Chronology and scope are available through Details rather than competing with the immediate next step.

The review question is not which mockup looks more “agentic.” It is which view helps the owner notice exceptions, trust the state, and inspect evidence with the least memory and interaction cost.

## Verification gate

Before accepting either direction for implementation:

- verify default, filtered, selected, reset, empty, and fallback states;
- verify at least Queued → Running → Waiting and Running → Canceled-with-uncertainty paths without layout jump;
- verify desktop and mobile widths, zoom, overflow, keyboard order, visible focus, semantic headings, and non-color state cues;
- compare every displayed state and qualifier with a golden canonical projection;
- confirm there are no approve, cancel, retry, execute, claim, scope, credential, or environment controls;
- confirm all examples and screenshots contain synthetic data only.

Passing this design review would accept a presentation direction. It would not prove A2UI compatibility or authorize application implementation or deployment.
