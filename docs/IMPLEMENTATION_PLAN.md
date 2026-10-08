# flipp Work Ledger implementation plan

Version 0.2 · 8 October 2026 · Proposed; all implementation gates NOT RUN

## Scope and controlling documents

This plan sequences implementation after separate authorization. Creating this document does not authorize a build, deployment, spending, new persistent grants, private data, or external actions. The current repository contains design documents and synthetic static mockups. Prior mockup render checks are design evidence only; they do not pass any implementation gate below.

The [PRD](PRD.md), [constraint matrix](CONSTRAINTS.md), [system design](SYSTEM_DESIGN.md), and [UI experience](AGENT_UI_EXPERIENCE.md) control implementation. The [payload contract](PRD.md#agent-and-human-payload-contract) controls query and event schemas. Resolve contradictions before coding; update an architecture decision when a proposed mechanism changes.

The assistant selects and operates its authorized tools, Mac, or cloud environment. The ledger records and coordinates work; it neither executes it nor holds external-service credentials. V1 enables one owner and one primary assistant principal. Future identity and dependency contracts remain explicit, but multi-agent execution, handoff, and delegation stay disabled.

## Gate policy

Every phase has entry conditions, reviewable deliverables, required evidence, a go/no-go decision, and recovery. All dependencies must pass on the exact candidate build and identified environment. A missing, expired, inconclusive, or NOT RUN result blocks progression. A local simulation cannot substitute for a required real-client check.

Constraint status follows the matrix: design-accepted, implemented-unverified, verified, or explicitly exception-approved. Evidence records additionally use NOT RUN, RUNNING, PASS, FAIL, or BLOCKED. These execution labels do not automatically change a constraint's status.

C01, C03, C04, C07, and C10 are non-waivable for the private pilot, following the matrix. Other exceptions require the owner's explicit record of scope, risk, compensating control, affected build/environment, expiry, and remediation. New authority or credentials cannot be obtained through an exception shortcut.

## Sequence and dependencies

| Slice | Dependency | Outcome | Gate status |
| --- | --- | --- | --- |
| G0 · Baseline and contracts | Implementation authorization and decisions sufficient for local work | Versioned schemas, test harness, boundaries, evidence register | NOT RUN |
| G1 · Real client connectivity | G0; separately authorized synthetic test environment/account access | Authenticated event → intended conversation → current-task fetch | NOT RUN |
| G2 · Canonical state and commands | G1 | Transactional state machine, narrow commands, receipts, audit | NOT RUN |
| G3 · Claims, scheduling, recovery | G2 | Fenced attempts, cancellation, durable wakes, outbox recovery | NOT RUN |
| G4 · Privacy, projections, restore | G2 and G3 | Isolated human/agent views, retention and quarantined restore | NOT RUN |
| G5 · Minimal UI and bounded A2UI | G4; selected protocol/catalog decisions | Truthful kanban and Details, safe adapter and fallback | NOT RUN |
| G6 · Synthetic system pilot | G0–G5 | Whole-system evidence at approved synthetic envelope | NOT RUN |
| G7 · Private pilot admission | G6 and explicit private-data/deployment approval | Restricted private pilot with recovery and cost controls | NOT RUN |

G1 is deliberately early. Build only enough disposable server plumbing and synthetic contracts to prove connectivity. Do not build the full database, scheduler, or generated UI before this loop is proven.

## G0 · Baseline, schemas, and local harness

**Entry:** implementation is separately authorized; canonical documents reconciled; selected language/runtime and local tooling recorded. Exact dependency versions remain unresolved until selected.

**Deliverables:** module boundaries for identity/policy, domain, storage, scheduling, outbox, MCP, and query/UI; contract schemas for commands, receipts, events, agent and human views; deterministic synthetic fixtures and clock; property-test state model; reproducible dependency lockfile; migration strategy; evidence register. Freeze v1 command allowlist. Preserve principal/run/attempt IDs and future dependency revisions without enabling multi-agent behavior.

**Verification/evidence:** schema validation of the public example and malformed/missing/unknown/null cases; command and projection snapshots; dependency/import boundary checks; deterministic repeat of seeded state tests; fixture/privacy scan. Record toolchain and schema versions. Proposed CI stages below must become real repository commands before they are documented as executable.

**Exit:** schemas and boundary review accepted; harness proves it can detect a seeded invalid transition, stale write, and disallowed projection field; no arbitrary execution/environment/credential tool exists. Otherwise STOP.

**Recovery:** revise contracts/fixtures before implementation; retain failed evidence. No runtime or migration is active.

**Owner decisions:** runtime/toolchain and initial target client/account; any unresolved product semantics needed to freeze contracts. No blanket access grant.

**Trace:** C01–C04, C06, C12–C14; PA01, PA02, PA03.

## G1 · Authenticated real-client connectivity spike

**Entry:** G0 passed; intended client, account, conversation targeting, remote endpoint, authentication mechanism, event contract, and callback destination identified. Owner explicitly approves any new persistent grant, deployment, or spending required for the spike. Existing authorized access may be reused within its scope. If access requires human setup, record BLOCKED and the exact requirement; do not invent credentials, broaden grants, or replace the wake path with browser automation or another integration.

**Deliverables:** disposable synthetic endpoint with the narrowest read surface; for a write demonstration, only the atomic version/idempotency/receipt behavior required by C06/C14. Test subscription and signed event delivery with tiny IDs/version/reason. A milestone record separates subscription, callback receipt, conversation resume, task fetch, acknowledgment, claim, and actual start.

**Verification/evidence in the real account/client:**

- Authenticate and fetch the correct synthetic task as the authorized principal; anonymous, wrong-owner, caller identity override, and revoked requests fail without enumeration.
- Send a signed attention event, observe the intended existing conversation resume, and fetch the correct current task/version. Record attributable timestamps and opaque test references; sanitize public evidence.
- Repeat after reconnect and authentication refresh. Exercise expiry/renewal, unsubscribe, and revocation: delivery and access stop when required.
- Duplicate and reorder event delivery; stable event IDs/attention generations deduplicate. A stale event triggers current fetch, not a stale action.
- A callback 2xx alone does not count as fetch, start, or completion. Fetch/acknowledgment must not generate an unbounded new attention loop.
- Confirm the assistant selects its execution environment outside the ledger. Synthetic prompts/events cannot confer authority.

**Exit:** the full intended-conversation/current-fetch loop and isolation checks pass; repeatability and lifecycle behavior are recorded. Unsupported or ambiguous conversation resumption is NO-GO for the full build. Review architecture instead of silently substituting polling or a different client.

**Recovery:** stop synthetic delivery, unsubscribe, invalidate spike claims, and remove disposable resources only through their authorized lifecycle. Preserve minimized test receipts. If revocation cannot be proven, stop and resolve it before further work.

**Owner decisions:** explicit connection/grant and synthetic environment/cost approval where needed; accept or revise client choice after evidence.

**Trace:** C01, C03, C04, C06, C09, C10, C14, C15; PA02, PA07, PA08.

## G2 · Canonical state and narrow commands

**Entry:** G1 passed; storage/runtime choice and contract versions recorded. Any production-shaped synthetic deployment is separately authorized.

**Deliverables:** one authoritative transactional store; immutable scope/completion revisions; append-only attributable observations/audit; create/read/list/revise/observe/complete/cancel contracts; typed non-secret errors; stable durable receipts and receipt-retention policy. No generic state-update or external execution endpoint.

**Verification/evidence:** unit and model/property tests enumerate legal/illegal transitions and revisions. Concurrent expected-version mutations accept only one winner. Same idempotency key/input returns the original receipt; changed input conflicts. Crash injection at every transaction boundary proves task, audit, receipt, job, and outbox facts commit together or not at all. Scope changes invalidate stale completion proof; unattributed or mismatched observations fail. Completion requires the assistant's verified evidence and current revisions, not mere database presence. Migration compatibility/rollback tests preserve records and audit ordering. Receipt TTL tests prevent an expired receipt from allowing blind repetition of an uncertain external effect.

**Exit:** invariants pass on the canonical store adapter, not only an in-memory fake; command surface and errors match schemas; provenance and version traces are reviewable. Otherwise STOP.

**Recovery:** disable writes, retain canonical snapshot/audit, and use the tested migration rollback or forward repair. Do not reset history or replay external effects.

**Owner decisions:** canonical storage selection, receipt/audit retention, migration and recovery assumptions.

**Trace:** C01–C07, C12–C14; PA01, PA04, PA05, PA08.

## G3 · Leases, cancellation, scheduler, and outbox

**Entry:** G2 passed; lease/renewal, reconciliation, retry, expiry, and attention-generation policies recorded as hypotheses to test.

**Deliverables:** atomic leased/fenced claims; explicit start milestone; same-run renewal; replacement fencing; due jobs and alarms; independent reconciliation; minimal signed outbox events; bounded retries and poison diagnostics; cancellation invalidation; read-only uncertainty reconciliation.

**Verification/evidence:**

- Property and concurrency tests race two claims, renew/expiry/replacement, scope changes, start/cancel/result, and stale writers. Every mutation checks record version and relevant run/fence/scope/completion/cancellation revisions.
- An expired claim cannot accept a late write; a claim alone is not actual start. Lease TTL and clock-boundary tests avoid implicit grace periods.
- Timeout after possible external acceptance remains uncertain and blocks blind side-effect retry. Post-cancel observations can reconcile read-only without claim, queue, start, or reopening.
- Duplicate/late alarms, crashed handlers, delivery retries, out-of-order events, exhausted retries, and poison messages leave durable visible state. Reconciliation repairs stranded eligible work without repeating known effects.
- Stable event IDs and attention generations prevent feedback loops. Receiving or acknowledging a notification does not create the same notification endlessly.
- Local schedule and IANA-zone/DST cases retain intended timing; ambiguous times require explicit resolution. Subscription expiry and renewal are distinct from task checks.
- Malformed signatures, replay windows, redirect callbacks, private/local destinations, and revoked subscriptions fail closed. No callback 2xx becomes task progress.

**Exit:** all races and injected failure paths preserve invariants; missed jobs/expired claims/delivery failures have a visible reason and next step. Real target alarm/event behavior is also exercised.

**Recovery:** disable claims, due-job execution, and delivery; preserve state; run read-only diagnosis. Repair stale jobs using generations rather than replaying side effects.

**Owner decisions:** tested timing/retry/TTL settings and operational alert thresholds, without a hard assistant-start promise.

**Trace:** C03, C05–C10, C14, C15; PA05–PA08; UI02, UI03.

## G4 · Privacy, authorized projections, retention, and restore

**Entry:** G2/G3 passed; retention, browser authentication, principal revocation, and backup recoverability decisions approved for the intended pilot.

**Deliverables:** owner-derived routing; independently authorized card/board, Details, agent and audit queries; field allowlists; redacted logs/errors; minimal source references; deletion jobs; quarantined restore procedure plus external control journal or verified restoration manifest.

**Verification/evidence:** wrong-owner/anonymous/revoked/enumeration tests across every query and command; reject caller-supplied identity. Scan schemas, logs, errors, event bodies, repository fixtures, browser responses/source/client state, and A2UI data/action contexts for forbidden metadata, secrets, and source bodies. Golden projection tests compare card/Details/agent views from the same record version; stale projections cannot claim freshness. Test null meanings, required fields, unknown versions, pagination, out-of-order updates, and scope invalidation.

Delete/restore tests span the declared recovery window. Restoration starts with claims, alarms, subscriptions, and delivery disabled. Reconcile deleted/canceled/revoked records against controls outside the restored snapshot before activation. An absent or contradictory restoration manifest keeps quarantine in place. Prove rollback cannot resurrect execution or silently discard required deletion intent.

**Exit:** PA01–PA06 pass across all endpoints; retention and recovery promises match actual platform behavior; restored systems remain inert until reconciliation passes. No private data yet.

**Recovery:** revoke pilot access, disable writes/delivery, quarantine restored state, preserve minimized incident evidence, and repair redaction/retention before re-entry.

**Owner decisions:** retention/recoverability language, restoration control mechanism, browser/session policy, revocation handling.

**Trace:** C02–C05, C07, C08, C11, C14, C16; PA01–PA06; UI02, UI03, UI06.

## G5 · Deterministic minimal UI and bounded A2UI adapter

**Entry:** G4 passed; requested kanban presentation and protocol/catalog/renderer versions selected. A2UI compatibility is its own proof, separate from the already-passed wake loop.

**Deliverables:** deterministic human projection; six canonical state columns with title/status/next-step/time cards; expandable explanation/evidence; visible blockers/uncertainty; view/search/reset/mobile state jump; no drag/drop mutation; host-owned versioned catalog; bounded adapter validation; canonical safe-text fallback. Keep technical agent metadata server-side. V1 controls are presentation-only. Keep `sendDataModel: false`.

**Verification/evidence:** golden comparisons for every state and qualifier; canceled-with-uncertainty never looks resumed; old evidence never looks current because the page refreshed. Fuzz unknown protocol/catalog versions, component references, enum/action names, node counts, byte/string lengths and depth. Reject arbitrary code/HTML/CSS/imports, mutation actions, unsafe URLs, and full-model return. Invalid output must preserve state, blocker, next step, uncertainty, and freshness in fallback.

Run Clean Data Presentation review against actual final renders: desktop and mobile, zoom, default, attention/waiting, selected/expanded, search/empty/reset, stale and invalid-payload fallback. Check keyboard flow, visible focus, semantic reading order, no clipping/overflow, and non-color status cues. Capture exact-build screenshots and a concise evidence review; static mockup screenshots are not acceptance proof for the implemented renderer.

### Pinned visual reference

The current iteration to replicate is **Variant A, the textured-white kanban board**, at commit [930ae7933b9ba5cea8da73a36b33288cee333b16](https://github.com/ptw1255/flipp-work-ledger/tree/930ae7933b9ba5cea8da73a36b33288cee333b16). This user-requested kanban iteration supersedes the previous continuous-list baseline; it is not blanket final UI approval or implementation authorization. Variant B remains a comparison, not the default implementation target.

| Reference | Pinned artifact |
| --- | --- |
| Interactive source | [Variant A HTML](https://github.com/ptw1255/flipp-work-ledger/blob/930ae7933b9ba5cea8da73a36b33288cee333b16/mockups/variant-a-ledger.html) |
| Styling and texture | [CSS](https://github.com/ptw1255/flipp-work-ledger/blob/930ae7933b9ba5cea8da73a36b33288cee333b16/mockups/styles.css), [texture](https://github.com/ptw1255/flipp-work-ledger/blob/930ae7933b9ba5cea8da73a36b33288cee333b16/mockups/texture.svg) |
| Fixture and presentation | [Synthetic data](https://github.com/ptw1255/flipp-work-ledger/blob/930ae7933b9ba5cea8da73a36b33288cee333b16/mockups/data.js), [presentation logic](https://github.com/ptw1255/flipp-work-ledger/blob/930ae7933b9ba5cea8da73a36b33288cee333b16/mockups/app.js) |
| Desktop, collapsed | [1440 × 960 PNG](https://github.com/ptw1255/flipp-work-ledger/blob/930ae7933b9ba5cea8da73a36b33288cee333b16/mockups/screenshots/variant-a-desktop.png) |
| Mobile, collapsed | [390 × 844 PNG](https://github.com/ptw1255/flipp-work-ledger/blob/930ae7933b9ba5cea8da73a36b33288cee333b16/mockups/screenshots/variant-a-mobile.png) |
| Mobile, expanded uncertainty | [390 × 844 Details PNG](https://github.com/ptw1255/flipp-work-ledger/blob/930ae7933b9ba5cea8da73a36b33288cee333b16/mockups/screenshots/variant-a-mobile-detail.png) |

Visual acceptance under UI01/UI04 requires:

- Six columns map one-to-one to Queued, Running, Waiting externally, Blocked, Completed, and Canceled. Each card appears once. Attention qualifiers never create new states or disguise Blocked/Canceled as progress. Keep headings/counts and explicit filtered-empty columns.
- Apple-inspired textured white background, restrained frosted-glass cards, soft borders/shadows, orange attention cues, system typography, and quiet controls. Verify accessible text contrast, solid-white reduced-transparency fallback, and unsupported-blur fallback.
- Comparable column/card widths and density, whitespace, title/status/next-step hierarchy, and time placement. Use the source values as the starting baseline rather than approximating from a thumbnail.
- Collapsed cards keep title, truthful status/attention cue, next step, and relevant time. Coordination identities/revisions, leases, approval references, and the agent record remain outside human data; only the minimal authorized navigation/consistency envelope is delivered.
- Details expands explanation, scope, evidence timing, and history within the card. It must not conceal a blocker or uncertain outcome on the collapsed surface.
- Desktop shows six readable columns; intermediate widths wrap to three; mobile stacks six sections in the same order with a state-jump control that scrolls and focuses the heading. No horizontal page overflow, hover-only evidence, drag handles or drop targets. Canonical updates preserve/announce focus and card movement; filtering and disclosure never mutate state.

Reproduce the pinned fixed synthetic fixture, 14:32 UTC projection time, viewport dimensions above, device scale factor 1, 100% zoom, and recorded browser/OS/font versions. Capture the default All work view with empty search and every disclosure closed, then the Canceled-column card with Details open. For the mobile Details image, record the scroll position or card alignment. Also capture the attention lens, empty columns/search, mobile state jump, and reduced-transparency fallback. Capture implementation-only states such as stale projection and safe fallback separately; do not pretend the baseline image covers them.

Review matching baseline/candidate renders side by side or with a screenshot diff. Before acceptance, document tolerances for layout geometry, spacing, wrapping, texture, and typography; record any deviations and reviewer disposition. Browser font rasterization may require manual review of text differences. No universal pixel-perfect threshold is assumed, and no numerical tolerance is approved yet. Missing semantics, clipping, changed status meaning, concealed uncertainty, or leaked metadata are failures regardless of visual similarity.

Update the pinned baseline only after an agreed design revision, with its source commit, deterministic render state, new screenshots, and acceptance criteria recorded. Do not silently regenerate the reference to match implementation drift or remove meaning to match pixels. Clean Data Presentation and projection-security gates remain controlling.

**Exit:** UI01–UI06 and C16 pass; actual supported A2UI renderer/version verified; human payload allowlists survive generated surfaces. If adapter compatibility fails, stop its pilot; a conventional deterministic UI requires an explicit documented presentation decision, not a claimed A2UI pass.

**Recovery:** disable the generated adapter and serve the tested canonical fallback; preserve query authorization and read-only behavior. Roll back a renderer/catalog only to a compatible tested pair.

**Owner decisions:** exact A2UI protocol/catalog/renderer pin and accepted UI direction.

**Trace:** C01–C04, C08, C09, C12, C14, C16; PA01–PA06; UI01–UI06.

## G6 · Whole-system synthetic pilot

**Entry:** G0–G5 passed on one identified release candidate; synthetic environment and capacity envelope approved; no real source data.

**Deliverables:** end-to-end synthetic journey suite; soak/load and recovery evidence; operating runbook; cost measurements and pricing/limits review; incident stop procedure; release evidence index.

**Verification/evidence:** run create → eligibility → event → intended-conversation fetch → claim → actual start → observation/wait → verified completion. Include blocked owner decision, revoke/scope change, cancel while in flight, uncertain result, missed check, expired claim, duplicate/reordered event, permanent delivery failure, reconnect, source-version lag, delete/restore quarantine, and migration recovery. Keep external effects in an explicitly authorized synthetic receiver.

Load the proposed envelope only after approval; measure latency, reconciliation duration, storage, retained receipts/audit, delivery traffic, cost, and capacity failure behavior. Do not report sample timings as a start SLA or free-tier guarantee. Repeat critical real-client proof on the release candidate; prior spike proof does not cover later authentication or delivery changes.

**Exit:** complete evidence index, no open blocking gate, verified recovery runbook, measured operating assumptions, and approved limits. Otherwise no private-data admission.

**Recovery:** stop synthetic ingress/claims/delivery, retain diagnostic state, replay only safe test inputs through documented procedures, and rerun affected gates after repair.

**Owner decisions:** pilot capacity, cost cap/alerts, actual environment, residual limitations and remaining explicitly waivable exceptions.

**Trace:** C01–C16; PA01–PA08; UI01–UI06.

## G7 · Private pilot admission

**Entry:** G6 passed; explicit approval for private data, deployment, retention, permitted runtime scope, accounts/grants, and monthly budget/alerts. A design approval or GitHub publication does not satisfy this condition.

**Deliverables:** limited one-owner/one-primary-assistant pilot; audited principal mapping; approved data categories and retention; operating controls for stop, revoke, export/delete, backup/restore quarantine, capacity and cost.

**Verification/evidence:** final preflight on exact build/environment; isolation/redaction and revocation checks; first-task evidence review with private artifacts retained privately; monitored lease/check/delivery/uncertainty failures. Verify only minimized runtime data is admitted. Real external work still requires the assistant's existing action-time authority.

**Exit:** pilot may continue only within approved limits and passing controls. Declare MVP accepted only after definition of done below; no unrestricted production rollout is implied.

**Recovery:** stop new ledger execution cues/delivery, revoke affected principals, quarantine restore when needed, and reconcile external outcomes read-only. Notify through an authorized incident workflow; never publish private evidence in this repository.

**Owner decisions:** explicit pilot admission and any later expansion; new grants, multi-agent enablement, spending, or public deployment require separate authorization.

**Trace:** C01–C16; PA01–PA08; UI01–UI06.

## Acceptance references

PA IDs below alias the eight numbered [PRD payload acceptance cases](PRD.md#contract-acceptance-cases); they add traceability without replacing those requirements.

| ID | Required proof |
| --- | --- |
| PA01 | Required fields/types/null semantics/contract versions validate |
| PA02 | Wrong-owner, revocation, view permissions, and server-derived identity |
| PA03 | Browser/A2UI projection redaction and agent-only metadata exclusion |
| PA04 | Card/Details version consistency, evidence age, stale/reordered projections |
| PA05 | Scope/proof invalidation, stale fences/revisions, stable duplicate receipts |
| PA06 | Canceled uncertainty remains visible; no resumed execution |
| PA07 | Minimal events; callback/delivery is not completion |
| PA08 | Assistant verification and attributable current-revision completion evidence |

UI IDs trace [UI experience verification](AGENT_UI_EXPERIENCE.md#verification-gate) and C16:

| ID | Required proof |
| --- | --- |
| UI01 | Useful minimal kanban; canonical grouping/counts and honest scope/search/reset/empty columns |
| UI02 | All canonical states and blockers/expired/missed/uncertain qualifiers survive every lens |
| UI03 | Evidence observation, last check, and projection freshness remain distinct |
| UI04 | Canonical column placement/movement, disclosure and state jump; desktop/mobile/zoom/keyboard/focus/reading order; contrast/reduced transparency |
| UI05 | Bounded host catalog/action allowlist, no mutations or arbitrary code, safe truthful fallback |
| UI06 | Synthetic public examples; no private agent payload in human browser/A2UI responses |

## Proposed CI and verification lanes

These are pipeline stages, not executable commands. No application package, test runner, deployed environment, or CI workflow is currently claimed to exist. Select real tools and add their actual commands during G0.

| Stage | Local or CI proof | Real environment proof |
| --- | --- | --- |
| Format/lint/type | Source/schema formatting, static types, dependency boundaries | None |
| Unit | Policy, projection, clocks, domain transitions | Does not prove platform behavior |
| Property/model | Seeds and minimized failure traces for races, revisions, idempotency, cancellation, TTL, dependency cycles | Target adapter concurrency repeat |
| Contract | Commands/receipts/views/events, invalid versions/nulls, compatibility | Exact client/server protocol and renderer compatibility |
| Integration | Store transactions, migrations, scheduler/outbox with injected failures; local platform emulator where supported | Actual store/alarm/retry/reconnect/revocation semantics |
| Security/privacy | Isolation, injection boundaries, redaction, forbidden fields, callback validation | Actual identity/grants, target callback verification, deployment config |
| E2E/render | Synthetic UI, disclosure, filters, keyboard, overflow, fallback; rendered evidence | Intended conversation loop and exact supported renderer |
| Recovery/load | Synthetic faults, restore quarantine, deletion reconciliation, proposed capacity | Authorized backup recovery, measured runtime/cost/limits |

Per-change CI blocks merging/releasing when its required checks fail. A release candidate additionally needs real-account, recovery, and render evidence. Do not automatically provision accounts or persistent grants from CI. Security or restore failures stop the affected lane and prevent promotion. Publish only sanitized traces; secrets and real runtime evidence stay in approved private storage.

## Evidence artifact template

Create one record per proof and link it from a release index. Initial status is NOT RUN. Public records use synthetic identifiers and redacted facts; sensitive logs, exact account details, credentials, and private runtime data must not be committed.

```text
proof_id:
phase: G0..G7
requirements: [Cxx, PAxx, UIxx]
status: NOT RUN | RUNNING | PASS | FAIL | BLOCKED
candidate_commit:
contract_and_catalog_versions:
runtime_and_dependency_versions:
environment_kind: local | emulator | real-synthetic | private-pilot
target_client_and_build: private reference if sensitive
approved_scope_reference:
test_case_and_expected_result:
actual_result:
random_seed_or_reproduction_reference:
artifact_references: sanitized trace, render, receipt, recovery report
observed_at:
reviewer:
blocking_findings:
decision: GO | NO-GO | NOT REVIEWED
recovery_or_remediation:
exception_reference_and_expiry: none unless explicitly approved
```

A PASS must name the exact build and artifact, not merely a screenshot or verbal assertion. A code/config/schema/catalog change invalidates affected evidence; rerun those gates. Evidence unrelated to the change need not be repeated without a concrete reason.

## MVP definition of done

- G0–G7 exit decisions recorded for the exact pilot release; required C01–C16 proof verified, with only permitted explicit unexpired exceptions.
- Real authenticated intended-conversation wake/fetch loop proven with reconnect, unsubscribe, and revocation.
- One canonical transactional ledger; narrow versioned/idempotent commands; attributable evidence; safe leases/fences; honest cancellation and uncertain-outcome recovery.
- Due work and delivery failures remain visible; retries cannot create a feedback loop or imply completion.
- Human board/card/Details and agent/event contracts validated; server auth and redaction proven; technical metadata absent from human client payloads.
- Minimal responsive read-only kanban UI and bounded adapter/fallback pass actual render, keyboard, integrity, and truth tests.
- Retention/deletion/restore quarantine and operational stop/revoke procedures verified; restore cannot resurrect execution.
- Approved private pilot scope, budget, limits, and data categories recorded. The assistant remains responsible for external authority, execution, and truth.
- Remaining limitations documented: no universal at-most-once external effect guarantee, no inferred environment availability, no hard assistant-start SLA, and no claim of guaranteed free operation.

## Decisions still unresolved

Pin exact language/runtime, test tools, platform configuration, MCP/client/account/build, authentication/session strategy, callback lifecycle, A2UI protocol/catalog/renderer, deployment target, retention/receipt TTL, backup control mechanism, lease/retry/reconciliation settings, pilot capacity, monthly budget/alerts, and private-data categories before the relevant gate. Current design values are hypotheses, not approved defaults. There is no completion date or approved budget in this plan.

## Deferred work

Multi-agent execution/delegation/handoffs, multi-owner tenancy, external-service credential storage, environment discovery or Mac control, generic execution tools, unrestricted UI mutations, additional stores/services without measured need, and broad production rollout are outside MVP implementation. Future relationship/provenance contracts remain in the schema; enabling their execution behavior requires its own authorization, scope/fencing/join proof, and release gate.
