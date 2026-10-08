const copy = {
task_synth_104:{title:"Check callback delivery",status:"Follow-up overdue",update:"The callback arrived. The follow-up check hasn’t happened yet.",next:"Agent: check the task before trying again.",note:"Running · claim expired",lens:"attention"},
task_synth_103:{title:"Choose retention periods",status:"Your decision needed",update:"The retention proposal is ready for your review.",next:"Choose the retention periods in chat.",note:"Blocked · owner decision",lens:"attention"},
task_synth_101:{title:"Check dependency status",status:"Check missed by 18 minutes",update:"The dependency was still pending at the last check. The next check is overdue.",next:"Agent: check the source again.",note:"Waiting externally · missed check",lens:"attention"},
task_synth_107:{title:"Confirm publication outcome",status:"Canceled · outcome unknown",update:"Work is canceled. The original publication may still have gone through.",next:"Agent: check the original result.",note:"Read-only check. Publication won’t restart.",lens:"attention"},
task_synth_105:{title:"Prepare reconnect test",status:"Queued",update:"The test data is ready. The approved environment is still needed.",next:"Agent: start when the approved environment is available.",note:"Queued",lens:"waiting"},
task_synth_099:{title:"Validate UI payload",status:"Completed",update:"The sample payload passed its validation checks.",next:"No further action.",note:"Completed · evidence verified",lens:"complete"}
};
const tasks=window.ledgerTasks,escape=window.ledgerHelpers.escape;
const list=document.querySelector("#task-list"),detail=document.querySelector("#detail"),search=document.querySelector("#search");
let lens=document.body.dataset.variant==="b"?"attention":"all";
let selectedId=document.body.dataset.variant==="b"?"task_synth_103":"task_synth_104";
const attentionIds=["task_synth_103","task_synth_107","task_synth_104","task_synth_101"];
function visibleTasks(){
 const query=search.value.toLowerCase().trim();
 return [...tasks].sort((a,b)=>{const rank=id=>attentionIds.includes(id)?attentionIds.indexOf(id):10;return rank(a.id)-rank(b.id);}).filter(task=>{
 const c=copy[task.id];return (lens==="all"||(lens==="attention"?c.lens==="attention":c.lens==="waiting"))&&(!query||[c.title,c.status,task.state].join(" ").toLowerCase().includes(query));});
}
function renderDetail(task){
 if(!task){detail.innerHTML='<p class="empty">Choose a task to see its update.</p>';return;}
 const c=copy[task.id];
 detail.innerHTML=`<div class="eyebrow">${escape(c.status)}</div><h2>${escape(c.title)}</h2><p class="update">${escape(c.update)}</p><div class="next-label">Up next</div><p class="next">${escape(c.next)}</p><p class="human-note">${escape(c.note)}</p>
 <details class="disclosure"><summary>Details</summary><dl class="facts">
 <div><dt>State</dt><dd>${escape(task.state)}</dd></div><div><dt>Condition</dt><dd>${escape(task.qualifier)}</dd></div>
 <div><dt>Scope</dt><dd>${escape(task.scope)}</dd></div><div><dt>Timing</dt><dd>${escape(task.due)}</dd></div>
 <div><dt>Last check</dt><dd>${escape(task.lastCheck)}</dd></div><div><dt>Evidence</dt><dd>Observed ${escape(task.observedAt)}</dd></div>
 <div><dt>View updated</dt><dd>14:32 UTC</dd></div></dl>
 <p class="evidence">${escape(task.evidence)}<small>Synthetic evidence · observed ${escape(task.observedAt)}</small></p>
 <ol class="history" aria-label="Task history">${task.chronology.map(entry=>`<li><time>${escape(entry[0])}</time><div>${escape(entry[1])}<small>${escape(entry[2])}</small></div></li>`).join("")}</ol></details>`;
}
function render(){
 const visible=visibleTasks();if(!visible.some(t=>t.id===selectedId))selectedId=visible[0]?.id;
  if(document.body.dataset.variant==="a"){
    const states=["Queued","Running","Waiting externally","Blocked","Completed","Canceled"];
    const slug=state=>state.toLowerCase().replaceAll(" ","-");
    const card=task=>{
      const c=copy[task.id];
      const times={task_synth_104:"Overdue",task_synth_103:"No deadline",task_synth_101:"Due 14:14",task_synth_107:"Review 15:00",task_synth_105:"When available",task_synth_099:"Completed 13:18"};
      return `<li class="action-card"><div class="card-top"><span class="task-status ${c.lens==="attention"?"attention":""}">${escape(c.status)}</span></div><h3>${escape(c.title)}</h3><p class="card-next">${escape(c.next)}</p><p class="card-time">${times[task.id]}${times[task.id].match(/[0-9]/)?" UTC":""}</p><details class="card-disclosure"><summary>Details<span class="sr-only"> for ${escape(c.title)}</span></summary><p class="card-update">${escape(c.update)}</p><p class="human-note">${escape(c.note)}</p><div class="evidence">${escape(task.evidence)}<small>Evidence observed ${escape(task.observedAt)} · view updated 14:32 UTC</small></div><p class="card-scope"><strong>Scope</strong> ${escape(task.scope)}</p><ol class="history" aria-label="Task history">${task.chronology.map(entry=>`<li><time>${escape(entry[0])}</time><div>${escape(entry[1])}<small>${escape(entry[2])}</small></div></li>`).join("")}</ol></details></li>`;
    };
    list.innerHTML=states.map(state=>{
      const members=visible.filter(task=>task.state===state);
      return `<section class="board-column" id="column-${slug(state)}" aria-labelledby="heading-${slug(state)}"><div class="column-heading"><h2 id="heading-${slug(state)}" tabindex="-1">${state}</h2><span aria-label="${members.length} tasks">${members.length}</span></div><ol class="column-cards">${members.map(card).join("")}</ol>${members.length?"":'<p class="column-empty">No tasks in this view</p>'}</section>`;
    }).join("");
    document.querySelector("#empty").hidden=visible.length>0;
    document.querySelector("#active-scope").textContent=`${visible.length} of ${tasks.length} tasks · ${visible.filter(task=>copy[task.id].lens==="attention").length} need attention${search.value.trim()?" · search results":""}`;
    document.querySelectorAll("[data-lens]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lens===lens)));
    return;
  }
 list.innerHTML=visible.map(task=>{const c=copy[task.id];return `<li class="task-row"><button type="button" data-task-id="${task.id}" aria-current="${task.id===selectedId}"><div class="row-text"><div class="task-title">${escape(c.title)}</div><div class="task-status ${c.lens==="attention"?"attention":""}">${escape(c.status)}</div></div><span class="chevron" aria-hidden="true">›</span></button></li>`;}).join("");
 document.querySelector("#empty").hidden=visible.length>0;
 document.querySelector("#active-scope").textContent=`${visible.length} ${lens==="all"?"tasks":lens==="attention"?"need attention":"waiting"}${search.value.trim()?" · search results":""}`;
 document.querySelectorAll("[data-lens]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lens===lens)));
 list.querySelectorAll("[data-task-id]").forEach(button=>button.addEventListener("click",()=>{selectedId=button.dataset.taskId;render();if(matchMedia("(max-width:760px)").matches)detail.scrollIntoView({block:"start"});}));
 renderDetail(tasks.find(t=>t.id===selectedId));
}
document.querySelectorAll("[data-lens]").forEach(b=>b.addEventListener("click",()=>{lens=b.dataset.lens;render();}));
search.addEventListener("input",render);
document.querySelector("#reset").addEventListener("click",()=>{lens=document.body.dataset.variant==="b"?"attention":"all";search.value="";render();search.focus();});
document.querySelector("#state-jump")?.addEventListener("change",event=>{
  const target=document.querySelector("#heading-"+event.target.value);
  if(target){target.scrollIntoView({block:"start"});target.focus({preventScroll:true});}
});
render();
