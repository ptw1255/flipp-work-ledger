# UI mockups

These static prototypes compare two read-only interface directions using the same synthetic task data:

- [Variant A: action list](variant-a-ledger.html) — the selected direction: compact rows in one continuous list, with explanation and evidence in Details.
- [Variant B: attention](variant-b-attention.html) — a comparison direction with a short queue and selected update.

The human surface shows only the information needed to understand work and its next step. [The synthetic agent payload example](agent-payload.example.json) retains coordination fields for an authorized agent query. Hidden UI is not access control: a real implementation must keep that payload server-side and enforce owner-scoped authorization.

They are design artifacts only. They are not connected to the ledger, authentication, MCP Events, an assistant, Cloudflare, or A2UI. Controls change presentation state only; there are no approve, cancel, retry, execute, or scope-mutation actions.

## Review images

| Direction | Desktop | Mobile overview | Mobile detail |
| --- | --- | --- | --- |
| A · Compact ledger | [PNG](screenshots/variant-a-desktop.png) | [PNG](screenshots/variant-a-mobile.png) | [PNG](screenshots/variant-a-mobile-detail.png) |
| B · Attention + chronology | [PNG](screenshots/variant-b-desktop.png) | [PNG](screenshots/variant-b-mobile.png) | [PNG](screenshots/variant-b-mobile-detail.png) |

The data and timestamps are synthetic and fixed so layout reviews are reproducible.
