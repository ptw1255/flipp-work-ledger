window.ledgerTasks = [
  {
    id: "task_synth_104",
    state: "Running",
    qualifier: "Expired claim",
    qualifierTone: "alert",
    title: "Verify callback delivery",
    outcome: "Prove the signed event resumes the intended synthetic conversation and fetches this task.",
    scope: "Synthetic MCP Events connectivity gate",
    next: "Read current task state before any replacement attempt.",
    due: "Recovery review due now",
    lastCheck: "14:01 UTC",
    observedAt: "14:00 UTC",
    freshness: "Projection refreshed 14:32 UTC",
    evidence: "Synthetic callback receipt recorded; no subsequent task fetch has been recorded.",
    attention: "Claim expired 26 min ago",
    attentionAge: "26m",
    chronology: [
      ["14:06 UTC", "Claim expired", "The ledger claim expired. This does not prove the external callback failed."],
      ["14:01 UTC", "Callback receipt recorded", "A synthetic receiver returned 2xx; assistant fetch remains a separate milestone."],
      ["13:58 UTC", "Attempt started", "Synthetic connectivity attempt began under scope revision 3."],
      ["13:55 UTC", "Task claimed", "Lease issued to the primary assistant principal." ]
    ]
  },
  {
    id: "task_synth_103",
    state: "Blocked",
    qualifier: "Owner decision",
    qualifierTone: "alert",
    title: "Choose retention defaults",
    outcome: "Resolve task, diagnostic, and restore-window retention before private data is admitted.",
    scope: "Documentation and private-pilot policy only",
    next: "Discuss the proposed retention periods in chat.",
    due: "No deadline set",
    lastCheck: "13:42 UTC",
    observedAt: "13:42 UTC",
    freshness: "Projection refreshed 14:32 UTC",
    evidence: "The design proposes 90-day completed-task and 30-day diagnostic retention; owner approval is not recorded.",
    attention: "Decision blocks private pilot",
    attentionAge: "50m",
    chronology: [
      ["13:42 UTC", "Blocked", "Owner decision required before any private runtime data is stored."],
      ["13:40 UTC", "Proposal recorded", "Synthetic review captured proposed retention and restore constraints."],
      ["13:38 UTC", "Task acknowledged", "Documentation-only scope confirmed." ]
    ]
  },
  {
    id: "task_synth_101",
    state: "Waiting externally",
    qualifier: "Missed check · 18m",
    qualifierTone: "warning",
    title: "Confirm scheduled status check",
    outcome: "Observe whether the synthetic dependency changed without duplicating work.",
    scope: "Read-only synthetic dependency observation",
    next: "Run the overdue read-only source check.",
    due: "Next check was 14:14 UTC",
    lastCheck: "13:44 UTC",
    observedAt: "13:43 UTC",
    freshness: "Projection refreshed 14:32 UTC",
    evidence: "Synthetic dependency remained pending at the last observation.",
    attention: "Scheduled check missed",
    attentionAge: "18m",
    chronology: [
      ["14:14 UTC", "Check became overdue", "No subsequent task check has been recorded."],
      ["13:44 UTC", "Waiting externally", "A read-only follow-up was scheduled for 14:14 UTC."],
      ["13:43 UTC", "Dependency observed", "Synthetic dependency reported pending." ]
    ]
  },
  {
    id: "task_synth_107",
    state: "Canceled",
    qualifier: "External outcome uncertain",
    qualifierTone: "alert",
    title: "Reconcile status publication",
    outcome: "Record whether a synthetic publication request was accepted before cancellation.",
    scope: "Read-only reconciliation; no new publication or compensating action",
    next: "Check for the original result without restarting execution.",
    due: "Reconciliation review at 15:00 UTC",
    lastCheck: "14:22 UTC",
    observedAt: "14:21 UTC",
    freshness: "Projection refreshed 14:32 UTC",
    evidence: "The synthetic request timed out after possible acceptance. Cancellation does not establish rollback.",
    attention: "Canceled · outcome unresolved",
    attentionAge: "10m",
    chronology: [
      ["14:22 UTC", "Canceled", "Future claims and wakes were invalidated."],
      ["14:21 UTC", "Outcome uncertain", "The synthetic external response was not observed before timeout."],
      ["14:19 UTC", "Attempt started", "Synthetic publication request began." ]
    ]
  },
  {
    id: "task_synth_105",
    state: "Queued",
    qualifier: "Eligible",
    qualifierTone: "",
    title: "Prepare reconnect test",
    outcome: "Repeat the synthetic MCP connection flow after a clean reconnect.",
    scope: "Synthetic connectivity test; no private data",
    next: "Claim when the connectivity gate environment is available.",
    due: "Eligible since 14:25 UTC",
    lastCheck: "14:25 UTC",
    observedAt: "14:25 UTC",
    freshness: "Projection refreshed 14:32 UTC",
    evidence: "Prerequisite synthetic test data is ready.",
    attention: "Ready to claim",
    attentionAge: "7m",
    chronology: [
      ["14:25 UTC", "Became eligible", "Synthetic prerequisites were recorded as complete."],
      ["14:12 UTC", "Queued", "Task waits for the approved connectivity-test environment." ]
    ]
  },
  {
    id: "task_synth_099",
    state: "Completed",
    qualifier: "Evidence verified",
    qualifierTone: "",
    title: "Validate bounded UI payload",
    outcome: "Confirm the synthetic presentation payload respects catalog and size limits.",
    scope: "Static validation fixture only",
    next: "No further action.",
    due: "Completed 13:18 UTC",
    lastCheck: "13:18 UTC",
    observedAt: "13:17 UTC",
    freshness: "Projection refreshed 14:32 UTC",
    evidence: "Synthetic fixture passed catalog, depth, item-count, enum, and string-length checks.",
    attention: "No attention required",
    attentionAge: "",
    chronology: [
      ["13:18 UTC", "Completed", "Completion rule satisfied with attributed synthetic evidence."],
      ["13:17 UTC", "Validation observed", "All documented presentation bounds passed for the fixture."],
      ["13:15 UTC", "Attempt started", "Static validation fixture loaded." ]
    ]
  }
];

window.ledgerHelpers = {
  stateMarkup(task) {
    return `<span class="state" data-state="${task.state}">${task.state}</span>`;
  },
  qualifierMarkup(task) {
    return `<span class="qualifier ${task.qualifierTone}">${task.qualifier}</span>`;
  },
  statePath(task) {
    const paths = {
      "Queued": ["Queued"],
      "Running": ["Queued", "Running"],
      "Waiting externally": ["Queued", "Running", "Waiting externally"],
      "Blocked": ["Queued", "Blocked"],
      "Completed": ["Queued", "Running", "Completed"],
      "Canceled": ["Running", "Canceled"]
    };
    const states = paths[task.state] || [task.state];
    return `<ol class="state-path" aria-label="State path">${states.map((state, index) => `<li>${index === states.length - 1 ? `<strong>${state}</strong>` : state}</li>`).join("")}</ol>`;
  },
  escape(value) {
    return String(value).replace(/[&<>"]/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[character]));
  }
};
