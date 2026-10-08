# flipp Work Ledger

A proposed private durable work-state and coordination layer for an assistant and its owner, with a Cloudflare-oriented design.

The assistant operates the ledger. The owner gets a read-mostly view of what is queued, running, waiting, blocked, completed, or canceled, with a clear next action and evidence behind each status. Scope changes and decisions stay in the existing chat.

## Project status

Planning and product review. This repository currently documents the proposed MVP; it does not contain a deployed application or a verified assistant integration.

Start with the [product requirements document](docs/PRD.md).

The [constraint acceptance matrix](docs/CONSTRAINTS.md) assigns stable IDs to the product boundaries and defines how each one becomes enforceable and testable.

The proposed technical shape, contracts, recovery model, and unresolved implementation decisions are in the [system design](docs/SYSTEM_DESIGN.md).

The [implementation plan and quality gates](docs/IMPLEMENTATION_PLAN.md) sequence the work from a real-client synthetic connectivity test through a separately approved private pilot. All implementation gates are currently NOT RUN.

Two responsive, synthetic-data-only interface directions are available in [mockups](mockups/README.md). They are static design prototypes, not a working ledger or A2UI integration.

The [agent-driven UI experience](docs/AGENT_UI_EXPERIENCE.md) defines how flipp selects what to surface while keeping layout, state semantics, and evidence bindings stable.

## Proposed scope

- Versioned task state, explicit approval scope, and evidence-backed completion
- Durable check scheduling, safe claims and retries, and cancellation handling
- A private web interface and remote MCP tools
- Events that notify the assistant when eligible work needs attention
- Minimal task data, with existing email and calendar connections staying on the assistant side

The first technical gate is an authenticated, synthetic end-to-end test of remote MCP tools and event-triggered assistant resumption in the intended client. Documented platform support is not proof that this deployment works.

## Privacy

Public source code does not make the runtime ledger public. Real tasks, source messages, personal contacts, credentials, signed URLs, and private account details must never be committed here. Examples and test fixtures must use synthetic data.

The PRD's authentication, retention, and architecture choices are proposals for review. New persistent access, infrastructure spending, and deployment need separate authorization.
