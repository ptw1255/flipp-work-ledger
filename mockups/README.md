# UI mockups

These static prototypes compare two read-only interface directions using synthetic task data:

- [Variant A: three-column work board](variant-a-ledger.html) — selected direction. Exactly three presentation columns: Not Started, In Progress, and Completed. Every card keeps its canonical state; each column scrolls independently.
- [Variant B: attention](variant-b-attention.html) — comparison direction with a short queue and selected update.

Variant A uses Apple-inspired textured white styling, restrained frosted-glass cards, progressive Details, and an explicit human/agent data boundary. Queued and Blocked map to Not Started. Running and Waiting externally map to In Progress. Canceled also stays outside Completed, visibly labeled “Stopped · not completed.” Only verified Completed records enter the newest-first done log.

The Completed log groups authoritative completion timestamps by the owner's configured local day (America/New_York in the deterministic fixture), breaks equal timestamps by stable task ID, and places missing timestamps last under **Completion time unavailable** without guessing.

The human surface contains only the information needed to understand work and its next step. [The synthetic agent payload example](agent-payload.example.json) retains coordination fields for an authorized server-side agent query. Hidden UI is not access control.

These are design artifacts only. They are not connected to the ledger, authentication, MCP Events, an assistant, Cloudflare, or A2UI. Controls change presentation state only; there are no approve, cancel, retry, execute, drag/drop, or scope-mutation actions.

## Review images

| Direction | Desktop | Mobile overview | Mobile detail |
| --- | --- | --- | --- |
| A · Three-column board | [PNG](screenshots/variant-a-desktop.png) | [PNG](screenshots/variant-a-mobile.png) | [PNG](screenshots/variant-a-mobile-detail.png) |
| B · Attention + chronology | [PNG](screenshots/variant-b-desktop.png) | [PNG](screenshots/variant-b-mobile.png) | [PNG](screenshots/variant-b-mobile-detail.png) |

The data and timestamps are synthetic and fixed for reproducible layout review. Desktop columns and stacked mobile sections have bounded, keyboard-focusable scroll regions. Mobile includes a column jump. Reduced transparency and unsupported blur use solid-white cards.

Additional Variant A states: [desktop Details](screenshots/variant-a-desktop-detail.png) · [attention filter](screenshots/variant-a-attention.png) · [reduced transparency](screenshots/variant-a-reduced-transparency.png).

[Design review and checks](KANBAN_REVIEW.md). This is static design evidence; backend/runtime gates remain NOT RUN.
