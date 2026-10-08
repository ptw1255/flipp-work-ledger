# flipp Work Ledger PRD

Version 0.4 · 8 October 2026 · For review

## Product direction

flipp Work Ledger is a private execution ledger for an assistant and its owner. It keeps approved work moving, records what actually happened, and gives the owner a read-mostly view of progress. The central question is simple: what is being worked on, what happens next, and what evidence supports that status?

The assistant uses the ledger as an execution engine. The owner continues to discuss priorities, scope changes, and decisions in chat. The interface should be useful without becoming another place the owner has to maintain tasks manually.

This PRD defines the proposed MVP. It does not authorize implementation, deployment, spending, account connections, or persistent access. Public source code and documentation must remain separate from private runtime data.

The companion [system design](SYSTEM_DESIGN.md) turns these product boundaries into proposed components, data contracts, invariants, recovery paths, and tests. It remains a design for review, not an implementation authorization.

### Decisions and proposals

**Established direction**

- Host the application on Cloudflare.
- Make the assistant the primary operator and give the owner a read-mostly window into its work.
- Treat recorded tasks as already approved within their documented scope unless explicitly marked otherwise. Changes to that scope are discussed in chat.
- Expose a remote MCP interface and events that can notify the assistant when work needs attention.
- Keep existing email and calendar connections on the assistant side. Store minimal task state and source references in the ledger.
- Make privacy and accurate execution status core requirements.

**Proposed for v1**

- One human owner and one primary scoped assistant identity. The data model and authorization boundaries should allow additional agent identities later without enabling them in the initial release. Additional people and sharing require a separate decision.
- A task list, a task detail view, and an activity history, with changes requested through the existing conversation.
- One authoritative task store with versioned mutations, durable wake scheduling, and recoverable event delivery.
- A modular monolith with stable internal interfaces. Split services only when observed scaling, isolation, or operational needs justify the added complexity.
- The Cloudflare component choices and retention defaults below, subject to review and a connectivity test.

### Goals and boundaries

The MVP should make unfinished work visible, resume eligible work after waits, and distinguish acknowledgment from execution and verified completion. It should make failures and uncertainty legible rather than silently dropping work or presenting stale progress as current.

Included: task capture, scoped execution state, due checks, external waits, evidence, audit history, cancellation, and private access. Excluded: a new chat application, a general project-management suite, shared family or team accounts, direct inbox ingestion, financial-data aggregation, a replacement for the assistant's existing tools or permissions, execution-environment selection, desktop connection management, external-service credential custody, and execution of external actions.

The ledger orchestrates task state, not the assistant's computers or tools. In this document, orchestration means determining task eligibility, coordinating claims and dependencies, scheduling wakes, emitting attention events, and recording observations and outcomes. The assistant remains responsible for choosing whether and how to use its available cloud tools, Mac environment, or other authorized integrations. If the required environment or tool is unavailable, the assistant records a generic blocker without asking the ledger to discover, connect to, or manage a machine.

### Product constraints

These constraints are release boundaries, not optional implementation preferences:

1. **Ledger, not executor.** The ledger never performs external actions, selects an execution environment, manages a desktop connection, inventories machines, or holds credentials for the assistant's external services. It records work, coordinates ledger ownership and timing, wakes the assistant, and accepts observations or results.
2. **Private runtime, minimal data.** Owner task data is private. Store concise task state, approval references, and evidence references rather than source messages, inbox contents, attachments, contact records, or copied documents. Public code, docs, examples, and fixtures use synthetic data only.
3. **Authority stays explicit.** A task or event records existing authority; it cannot create authority. Event payloads, source content, delegated results, and ledger fields are untrusted input and cannot expand scope. Action-time requirements still apply in the assistant's execution environment.
4. **One owner in v1.** The first release has one human owner and one primary assistant identity. Future multi-agent fields and interfaces must not weaken v1 isolation or introduce implicit shared ownership.
5. **One source of truth.** The canonical ledger state, version checks, claims, schedules, audit facts, and outbox live in one authoritative store for v1. Read models and events are derived and cannot mutate truth independently.
6. **Duplicate-safe ledger changes.** Mutations use expected versions and idempotency keys. Claims use expirations and fencing generations. Late workers, duplicate requests, retried alarms, repeated callbacks, and out-of-order events cannot silently repeat or overwrite accepted ledger state. These controls cannot lock, reverse, or prove the status of an already-started external action.
7. **Cancellation wins over future ledger work.** Cancellation invalidates future wakes and claims. A stale worker cannot record a successful completion after its claim or cancellation revision is superseded. Already-started external actions are preserved as observed or uncertain outcomes, not hidden, and may receive read-only reconciliation that cannot reopen execution.
8. **Failure is visible.** Missed wakes, expired claims, exhausted deliveries, disconnected subscriptions, unavailable tools, uncertain external results, and reconciliation repairs appear in task state or diagnostic history with a next step.
9. **Events are attention signals.** Delivery acknowledgment means receipt only. It does not prove that the assistant fetched, claimed, started, or completed a task. The assistant always rereads current ledger state before acting.
10. **No platform claim without a test.** Documentation may identify supported primitives, but remote MCP authentication, MCP Events, chat resumption, revocation, and reconnect behavior remain unverified until the synthetic end-to-end gate passes in the intended client.
11. **Cost needs a limit.** The design should be free-tier-oriented and low-traffic by default, but no free-tier availability or zero-cost operation is assumed. Deployment, paid plans, and a monthly spending cap require separate approval.
12. **Modular without distributed-system overhead.** Keep stable domain boundaries and versioned contracts inside a modular monolith. Do not add services, databases, queues, or orchestration products without evidence that their isolation or scale benefit exceeds their reliability and operating cost.

Proposed pilot guardrails are one owner, one primary assistant identity, at most 100 open tasks, 10,000 retained tasks, 100,000 audit entries, and one mutation per second with a short burst of 10. These are review values, not approved entitlements or performance promises. A five-minute claim lease with renewal after roughly one minute and reconciliation every five minutes are starting hypotheses that must be validated against actual assistant behavior and platform cost. The pilot has no hard assistant-start service-level agreement.

## Owner experience

The default view groups work into Queued, Running, Waiting externally, Blocked, Completed, and Canceled. Each row shows the outcome, responsible actor, deadline when present, last check, and next action. Sorting should make overdue checks and unresolved blockers easy to find without inventing a new urgency level for every task.

A task detail view shows its scope, approval reference, completion condition, current status evidence, upcoming check, and chronological activity. It distinguishes the age of the underlying evidence from the last time the page refreshed. Missing evidence or a missed check must be visible in text, not color alone. The interface should work on a narrow screen and support keyboard navigation.

The initial interface is read-only apart from navigation and filtering. Requests to change scope, pause work, resume work, or cancel go through chat. A conversation link may be shown only when a supported, verified link exists.

### Task states

| State | Meaning | Required information |
| --- | --- | --- |
| Queued | Work is recorded and eligible now or at a future time; execution has not begun | Next action, eligibility time, scope |
| Running | A worker holds a valid claim and has begun an execution attempt | Run identity, start time, claim expiry, current step |
| Waiting externally | Progress depends on an external result or future condition | What is awaited, last observation, next check or subscribed event |
| Blocked | Work cannot proceed because a decision, access, approval, or repair is needed | Specific blocker, who can resolve it, next step |
| Completed | The task's completion condition has been verified | Outcome, evidence reference, verification time |
| Canceled | The owner stopped the task and no further work is scheduled | Cancellation time, reason if given, any unresolved in-flight outcome |

Acknowledged, started, and verified complete are separate milestones. A successful event delivery is only delivery. A claim is only ownership of an attempt. Neither is proof that the requested work happened.

A task waiting on approval uses Blocked with an approval reason. An expired worker claim cannot leave a task appearing actively Running indefinitely. Completed and Canceled tasks do not resume automatically; reopening requires a new recorded instruction and scope revision.

### Minimum task record

- **Identity and purpose:** stable task ID, short title, desired outcome, creation source reference, completion condition, and responsible actor.
- **Relationships:** optional parent task, dependencies, delegated subtasks, and a join completion rule. These fields may remain unused in the single-agent MVP but should not require a disruptive schema redesign later.
- **Scope:** revision, allowed actions and destinations, relevant limits, approval status, and a reference to the instruction or approval. Preserve explicit exceptions.
- **Progress:** state, next action, blocker or dependency, last checked time, acknowledgment time, start time, and verification time.
- **Timing:** optional deadline, next eligible check, time zone, and any stopping condition. Store instants in UTC and retain the original IANA time zone for local-time schedules.
- **Evidence:** concise observed result, observation time, and a source link or external result ID. Avoid copying source documents or messages.
- **Execution:** record version, agent ID, run and attempt IDs, idempotency key, claim and fencing generation, claim expiry, cancellation revision, and delivery state.

Audit entries record the actor, time, operation, task version, changed fields, and relevant result reference. Record only the data needed to explain a change.

## Execution workflows

### Capture and begin approved work

1. The assistant records the requested outcome, scope, source reference, and completion condition. An unclear or unapproved action becomes Blocked rather than guessed permission.
2. The ledger commits the task and an acknowledgment milestone. Immediate work becomes eligible; future work receives a durable wake time.
3. The assistant reads the current record and atomically claims it against the expected version. Competing claims cannot both succeed.
4. Before acting, the assistant checks current scope, cancellation, and applicable action-time permissions. It records the attempt start separately from its claim.
5. After the action, it records the observed outcome and evidence. The assistant verifies real-world truth and authority at action time. The ledger validates the allowed transition plus evidence presence, attribution, and consistency with the current scope revision; it does not independently prove the external outcome. Only a satisfied completion condition permits Completed.

### Wait and resume

An unfinished task moves to Waiting externally with a named dependency and a check plan. The ledger schedules a wake or emits an event when its own state makes work eligible. The assistant then checks the external source through its existing connections and updates the record.

The ledger does not gain access to email or calendar by storing a link. Lack of source access becomes a visible blocker. Every wait must have a defined next check, subscribed event, or explicit reason no check is possible. An external event needs a verified delivery path; otherwise the assistant must perform scheduled source checks. Monitoring follows the task's approved purpose and stopping condition.

### Change or cancel

A chat instruction creates a new scope revision. A running worker must reread that revision before its next consequential action. Cancellation records a new revision, prevents new claims, and invalidates future wakes.

An in-flight external action may already have happened. In that case, preserve its observed result and show that cancellation did not undo it. An unresolved external outcome remains visible and may require read-only reconciliation. Do not relabel it as a successful rollback or automatically issue a compensating action without authority.

### Recover without duplicate effects

Use an idempotency key for each logical mutation and external operation where supported. Repeating the same key with the same input returns the original result; reusing it with different input fails. Version checks reject stale state updates.

A worker crash releases its claim only after lease expiry and reconciliation. If a request timed out after an external service may have accepted it, check for the original result before retrying. If that cannot be established, surface an uncertain outcome and block the repeated side effect. The product must not claim exactly-once execution across arbitrary external services.

An ordinary lease renewal by the same active run preserves its fencing generation. Replacement, reassignment, or recovery after expiry receives a newer generation. Ledger state writes and external-result attachments from a superseded worker are rejected even if that worker resumes late. Idempotency keys deduplicate the logical ledger operation; fencing prevents an old owner from writing after ownership has changed. Neither control can prevent or undo an external action that already started.

Commit state changes and pending notifications atomically through an outbox. Each outbox item has a stable event ID, retry state, and terminal failure reason. Retried or out-of-order events cause the assistant to read current task state before deciding what to do. Track callback receipt separately from the assistant fetching or claiming work. A reconciliation process detects missed schedules, expired claims, undelivered events, and delivered events that have not led to a task check. Recovery uses current state and the same deduplication rules.

### Future delegation and parallel work

The v1 operating model remains one primary assistant identity, but its contracts should support multiple scoped agent identities later. Each agent has a distinct ID, capability scope, and audit trail. A task has one active owner at a time. Parallel work uses explicit subtasks with parent and dependency relationships rather than several workers silently sharing ownership of one task.

Delegation is a scoped mutation. Policy must define which identity may create a subtask, choose its assignee, change scope, approve completion, or accept a result into its parent. A delegating agent may narrow authority but cannot grant an action, destination, data source, or credential beyond the parent's approved scope or its own capabilities. Missing authority blocks the delegated task.

The assistant-side execution environment gives each worker only the credentials and context required for its subtask; the ledger does not hold or distribute credentials for external services or machines. The ledger records the delegator, assignee, scope revision, supplied context references, result author, evidence, and every handoff. Shared results retain authorship and provenance when incorporated into a parent task. Content produced by another agent is untrusted evidence, not permission to expand scope.

A handoff atomically ends the prior claim and issues a new fenced claim after the recipient accepts or becomes eligible. Cancellation or access revocation invalidates future claims, wakes, and result writes for the affected identity. An already-started external action still follows the uncertain-outcome and reconciliation rules.

A parent task defines its join completion rule explicitly, such as all required subtasks completed, a named subset completed, or a decision task resolved. A parent cannot become Completed merely because workers returned responses; it must satisfy its own completion condition using accepted, attributable evidence. Failed, canceled, blocked, or superseded subtasks remain visible in the parent history.

## Cloudflare and assistant integration

### Proposed architecture

Use a Cloudflare Worker for the authenticated web application and remote MCP endpoint. Keep authentication for a person using the browser separate from authentication for the assistant's server-to-server tools. All routes must enforce owner and operation-level authorization. Keep remote MCP transport stateless at the Worker boundary; the Durable Object below holds application state. [Cloudflare MCP transport](https://developers.cloudflare.com/agents/model-context-protocol/protocol/transport/)

The remote MCP endpoint is the ledger's control and reporting interface. It lets the assistant read task state, request narrow transitions, claim eligible work, record evidence, and manage ledger events. It does not proxy arbitrary external operations, choose between cloud and Mac execution, establish desktop sessions, inventory machines, or store credentials for the services the assistant uses. The assistant performs authorized external work through its existing execution environments and integrations, then reports the result or blocker back to the ledger.

Use a [SQLite-backed Durable Object](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/) as the single authoritative ledger for the initial single-owner deployment. It holds tasks, claims, audit entries, and the event outbox. Serialize mutations there and schedule the earliest pending wake with an alarm. Persist later wake times in the ledger and reschedule after processing. Cloudflare documents that alarms have at-least-once execution and retries; handlers must therefore tolerate repeats. [Durable Objects alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)

Add a scheduled Worker reconciliation pass so exhausted alarm retries cannot silently strand due work. It checks the same authoritative store and repairs eligible scheduling or delivery state without replaying external actions. [Worker Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

This is an architecture proposal, not a final storage commitment. If the connectivity test or workload justifies D1, Queues, or Workflows, document that change before implementation and keep one source of truth. Adding multiple orchestration systems is not a requirement for v1. Cloudflare offers remote MCP hosting patterns, but compatibility with the target client's event protocol must be tested separately. [Cloudflare MCP](https://developers.cloudflare.com/agents/model-context-protocol/)

### Modular monolith boundaries

Keep the v1 application deployable as one Worker plus its canonical Durable Object, while separating these modules behind stable, versioned interfaces:

- **Task domain:** task state, scope revisions, relationships, completion rules, evidence, and audit entries.
- **Identity and authorization policy:** human and agent principals, capability scopes, delegation checks, and operation-level decisions.
- **Orchestration and scheduler:** eligibility, claims, fenced leases, dependency release, join evaluation, alarms, and reconciliation.
- **Event outbox and delivery:** event construction, subscriptions, signatures, retries, deduplication, and terminal delivery failures.
- **Ledger API and MCP adapter:** narrow contracts for task reads, state transitions, claims, observations, results, and event subscriptions, without arbitrary external-operation or machine-control tools.
- **Query and UI:** read models, filters, task detail, and accessibility behavior, without direct mutation of authoritative storage.

The task domain owns state invariants. Ledger authorization is checked at each module boundary. The assistant-side executor separately checks authorization again before consequential external actions. Ledger orchestration requests domain mutations through commands rather than editing storage directly. Delivery publishes committed facts from the outbox. Query code reads derived views and cannot become a second source of truth.

Define versioned command, result, and event schemas with compatibility rules and contract tests. Database changes use explicit, reversible migrations with a recorded schema version; readers tolerate an intentional compatibility window, while writers reject unknown contracts. Agent IDs, parent task IDs, dependency IDs, capability references, scope revisions, fencing generations, and idempotency keys are first-class fields even when the v1 interface uses only one agent and no parallel subtasks.

These are code and ownership boundaries, not a requirement for microservices, separate databases, or separate deployments. Extract a service only when measurements show a clear need for independent scaling, stronger fault or security isolation, or a different release lifecycle, and preserve the same authorization and data contracts when doing so.

### Proposed tool surface

Expose narrow operations to list and read tasks; create work; revise scope; claim, renew, and start an attempt; observe, wait, block, complete, cancel, or reconcile read-only; and read audit history. Do not expose a generic state-update operation. Mutations require an idempotency key, canonical input hash, and expected record version. Return a stable mutation receipt and enough information to verify the operation. Do not expose arbitrary SQL, arbitrary network requests, credential access, or permission administration as task tools.

### Event contract

OpenAI documents MCP Events for dots and supported Work chats, using MCP 2.0, authenticated discovery and subscription methods, and signed webhook callbacks. Implement `events/list`, `events/subscribe`, and `events/unsubscribe`, callback verification, and subscription expiry or renewal. A `2xx` callback response confirms receipt; processing is asynchronous. Preserve event IDs across retries, use fresh signatures, and follow the documented response-specific retry rules. [MCP Events](https://developers.openai.com/plugins/build/mcp-events)

Propose one initial application event, `task.needs_attention`, filtered to the authorized owner. Its payload contains only an event ID, task ID, task version, occurrence time, and a short reason. The assistant fetches the current task through MCP. Emit only when work becomes eligible or an unresolved check becomes due; routine progress writes must not create self-triggering loops. Event data and source text are untrusted input and cannot expand the task's authorization.

WebMCP may later improve interaction with the browser page. Its tools depend on the page being available, so it is optional and cannot supply the unattended wake path. [Site tools](https://learn.chatgpt.com/docs/webmcp)

### Connectivity gate before implementation

Using synthetic data, demonstrate in the intended client that a private remote MCP server can authenticate, expose tools and events, subscribe, deliver a verified event, resume the intended assistant conversation, and fetch the correct current task. Repeat after a reconnect; verify unsubscribe and revoked access stop delivery.

Documented platform support is not a passed test. Verify the actual protocol and SDK combination, including MCP 2.0 event support. If the intended client cannot complete this flow, stop and review the product approach before building the full application. Any new credentials, persistent grants, or paid services require explicit authorization before setup.

## Privacy and security

The runtime application is private even if its source repository is public. Proposed v1 access is limited to one human owner and a separately identifiable assistant principal. Every task read, write, event subscription, and event delivery must be authorized for that owner. The assistant identity receives only the ledger permissions it needs and cannot grant itself more access.

Store minimal task descriptions, state, approval references, and evidence links. Email, calendar content, attachments, and their credentials stay with the existing assistant-side integrations. Treat source URLs as potentially sensitive; exclude tokens and signed download links, and do not put task data in public URL parameters.

Credentials and event signing secrets belong in dedicated protected infrastructure storage, never task records, audit payloads, frontend code, logs, or the repository. Subscription metadata may retain an opaque reference to protected secret storage. Use encrypted transport, verified authentication, input validation, rate limits, and redacted operational logs. Validate callback destinations to prevent requests to local or private services. Do not follow callback redirects. These controls are release requirements, not guarantees established by choosing a hosting provider.

An approval record is a reference to the owner's instruction. It does not override the assistant's current confirmation requirements or turn an expired or changed instruction into permission. Third-party content cannot authorize new work.

### Proposed retention and deletion

These defaults need owner approval before private data is stored:

- Keep active task records while the task remains open. Review abandoned open tasks rather than retain them silently forever.
- Retain completed and canceled task details, evidence references, and related audit entries for 90 days, then delete them.
- Retain redacted operational diagnostics for 30 days. Exclude task text and source contents by default.
- On a deletion request, stop related schedules and subscriptions and make the records inaccessible promptly. Permanent deletion requires the applicable confirmation.
- Define the maximum backup retention and restoration behavior before launch. A restore must not resurrect canceled work, deleted data, or revoked access. Record any non-content tombstone needed to enforce that behavior.

Cloudflare currently documents 30-day point-in-time recovery for SQLite-backed Durable Objects. A primary-store deletion therefore does not imply immediate erasure from every recoverable point. Before launch, define the resulting recoverability window, owner-facing deletion language, and tombstone or post-restore reconciliation needed to prevent restored data from reviving work. [Durable Object storage and point-in-time recovery](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/)

Retention jobs must cover the primary store, outbox, logs, and backups. Export, deletion timing, residency needs, and recovery objectives remain review decisions.

## Acceptance and release

### MVP acceptance criteria

1. An authenticated owner can inspect each required state and see scope, next action, responsible actor, deadline, last check, and supporting evidence. Anonymous and wrong-principal requests fail.
2. A synthetic task can progress from acknowledgment to actual start to verified completion. The system rejects completion without the required evidence and never equates event receipt with task success.
3. Two concurrent claims produce one active owner. Stale writes fail. An expired claim becomes visibly stale and enters recovery rather than remaining apparently active.
4. Duplicate deliveries and retried mutations do not create duplicate task records or replay a known completed side effect. An uncertain external result blocks a blind retry.
5. A scheduled check survives a worker restart. A missed wake or exhausted delivery retry becomes visible, with a recovery action and diagnostic history.
6. A waiting task resumes when its approved condition is observed. Time-zone and daylight-saving tests preserve the intended local-time schedule; ambiguous times are resolved explicitly.
7. Cancellation racing with a claim or callback prevents new work. An already-started external action is reported honestly, with reconciliation when needed.
8. A scope expansion or missing approval blocks the relevant action. A ledger field cannot bypass action-time approval requirements.
9. Event subscription renewal, unsubscribe, revocation, replay handling, and callback rejection pass the connectivity and security tests. Failed, expired, or revoked subscriptions are visible, and the UI can report that no subsequent task check was recorded without inferring whether an assistant environment is connected.
10. Privacy tests find no source-content copies or secrets in task records, logs, public assets, or fixtures. Retention and restoration tests honor deletion and cancellation.
11. Contract tests keep module boundaries version-compatible across a schema migration. A simulated late worker cannot write through an expired fenced lease, and delegated or joined work cannot exceed parent authority or complete a parent without its stated join and evidence rules.

### Delivery sequence

First review this PRD and the unresolved decisions below. Then, if implementation is authorized, pass the synthetic connectivity test. Build and test the state machine and delivery recovery before a private owner pilot. Admit real task data only after authentication, secret handling, retention, and revocation checks pass. No production date is set by this document.

### Measures

Measure eligible-task-to-start delay, scheduled-check lateness, event-to-fetch delay, stale claims, undelivered events, blocked-task age, duplicate attempts prevented, uncertain external outcomes, and the share of completed tasks with valid evidence. Track runtime cost and owner interventions needed to recover work. Establish a pilot baseline before choosing performance or reliability targets.

### Decisions for review

- Confirm the single-owner, read-only interface for v1 and whether cancellation should later be available directly in the UI.
- Approve or revise the proposed Cloudflare components after the connectivity test.
- Choose human and assistant authentication, required scopes, and revocation behavior before granting persistent access.
- Set retention, backup limits, deletion behavior, and any regional data requirements.
- Choose acceptable check cadence, notification escalation, outage recovery expectations, and a spending limit before a pilot.
- Define the small set of synthetic and then privately approved tasks that will establish the pilot baseline.
- Before enabling multiple agents, define who may delegate, reassign, expand or narrow scope, accept results, and approve completion, plus the required credential isolation and revocation behavior.
