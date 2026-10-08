# flipp Work Ledger

A proposed private execution ledger for an assistant and its owner, hosted on Cloudflare.

The assistant operates the ledger. The owner gets a read-mostly view of what is queued, running, waiting, blocked, completed, or canceled, with a clear next action and evidence behind each status. Scope changes and decisions stay in the existing chat.

## Project status

Planning and product review. This repository currently documents the proposed MVP; it does not contain a deployed application or a verified assistant integration.

Start with the [product requirements document](docs/PRD.md).

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
