(function () {
  // Exploratory Council run activity (#17): one feed in which every output names the agent that produced it.
  // A member is an agent; the harness is secondary text and is never the speaker. Member, Optional and System
  // are Council role labels. Each state is a fixed fixture timeline so times, round, phase, and roster agree.
  const esc = HF.escape;
  HF.councilRunStates = ['council', 'council-consensus', 'council-member-left', 'council-failed'];
  const cast = [
    { name: 'Architect', role: 'Facilitator', label: 'facilitator', backend: 'claude' },
    { name: 'Frontend', role: 'Member', label: 'member', backend: 'codex' },
    { name: 'QA', role: 'Optional', label: 'optional member', backend: 'vibe' }
  ];
  const member = name => cast.find(item => item.name === name);
  const systemSpeaker = { name: 'Council', role: 'System', label: 'system' };
  const names = cast.map(item => item.name).join(', ');
  // Per-state header, Council node, and roster.
  const runStates = {
    council: { round: 2, phase: 'Voting on v2', node: 'Running', left: [] },
    'council-consensus': { round: 2, phase: 'Consensus on v2', node: 'Completed', left: [] },
    'council-member-left': { round: 1, phase: 'Discussing v1', node: 'Running', left: ['QA'] },
    'council-failed': { round: 1, phase: 'Failed', node: 'Failed', left: [] }
  };
  HF.councilRunSummary = state => {
    const run = runStates[state] || runStates.council;
    return { line: `${names} · round ${run.round} of 5`, phase: `Phase: ${run.phase[0].toLowerCase()}${run.phase.slice(1)}`, header: `Round ${run.round} of 5 · ${run.phase}`, status: run.node, left: run.left.slice() };
  };
  const harness = backend => `<span class="council-harness"><span class="backend-dot ${backend}" aria-hidden="true"></span>${esc(HF.harnessName(backend))}</span>`;
  const speaker = (who, time) => `<header class="council-speaker"><strong>${esc(who.name)}</strong><span class="council-role">${esc(who.role)}</span>${who.backend ? harness(who.backend) : ''}<time class="council-time">${esc(time)}</time></header>`;
  const article = (who, time, body, label = `${who.name}, ${who.label}, ${time}`) => `<article class="council-turn" aria-label="${esc(label)}">${speaker(who, time)}${body}</article>`;
  const chip = (kind, text) => `<span class="council-chip ${kind}">${kind === 'accept' ? '<span aria-hidden="true">✓</span> ' : kind === 'object' ? '<span aria-hidden="true">✕</span> ' : ''}${esc(text)}</span>`;
  const chips = (items, attributes = '') => `<div class="council-votes" ${attributes}>${items.join('')}</div>`;
  const round = label => `<div class="council-round" role="separator" aria-label="${esc(label)}"><span>${esc(label)}</span></div>`;
  const candidate = (version, text, supersedes) => `<div class="council-candidate"><div class="council-candidate-head"><strong>Candidate v${version}</strong>${supersedes ? `<span class="council-role">Supersedes v${supersedes}</span>` : ''}</div><p>${esc(text)}</p></div>`;
  const text = value => `<p>${esc(value)}</p>`;
  const note = value => `<p class="council-note">${esc(value)}</p>`;
  const card = (kind, title, lines) => `<div class="council-outcome ${kind}"><p class="council-outcome-title">${esc(title)}</p>${lines.map((line, index) => `<p class="${index === 0 && kind === 'consensus' ? 'council-outcome-body' : 'council-note'}">${esc(line)}</p>`).join('')}</div>`;

  const firstRound = disposition => [
    round('Round 1 of 5 · 14:36'),
    article(member('Architect'), '14:36', `${text('Here is the first candidate for retrying refunds when the provider times out.')}${candidate(1, 'Retry with exponential backoff and a per-refund idempotency key.')}`),
    article(member('Frontend'), '14:37', `${text('I object to v1: there is no upper bound, so on a stuck provider the refund screen spins forever with no end state to show.')}${chips([chip('object', 'Objects to v1')])}`),
    article(member('QA'), '14:38', `${text('Where does the key come from? If the provider retries on its side, will we still dedupe?')}<div class="council-ref"><span>Question to <strong>Architect</strong> · about Candidate v1</span>${chip(`disposition ${disposition.kind}`, disposition.label)}</div>`)
  ];
  const secondRound = () => [
    round('Round 2 of 5 · 14:41'),
    article(member('Architect'), '14:41', `<div class="council-ref"><span aria-hidden="true">↩</span><span>Reply to <strong>QA</strong>’s question</span></div>${text('The key is derived from the refund id, so provider-side retries dedupe too. Here is v2 with a bound for Frontend’s objection.')}${candidate(2, 'Retry with exponential backoff, at most 5 attempts, keyed by refund id.', 1)}`),
    article(systemSpeaker, '14:41', `${note('Candidate v2 supersedes v1. Acceptances and objections on v1 no longer count.')}${chips([chip('reset', 'Prior acceptances reset')])}`),
    article(member('Frontend'), '14:43', `${text('5 attempts gives the refund screen a definite end state. That covers my objection.')}${chips([chip('accept', 'Accepts v2')])}`),
    article(member('Architect'), '14:43', chips([chip('accept', 'Accepts v2')])),
    article(systemSpeaker, '14:44', `${note('Votes on Candidate v2: 2 of 2 required members accept. QA is optional, so the outcome does not wait for QA.')}${chips([chip('accept', 'Architect accepts'), chip('accept', 'Frontend accepts'), chip('', 'QA (optional): no vote yet')])}`)
  ];
  const outcomes = {
    consensus: article(systemSpeaker, '14:44', card('consensus', 'Consensus reached on Candidate v2', ['Retry with exponential backoff, at most 5 attempts, keyed by refund id.', 'Accepted by Architect and Frontend (2 of 2 required).', 'QA (optional) did not vote.', 'Caveat from Architect: the bound was not load tested.']), 'Council, system, consensus'),
    left: article(systemSpeaker, '14:39', card('warn', 'QA left the council', ['QA’s harness (Vibe) exited unexpectedly. QA is optional, so the council continues with Architect and Frontend.', 'QA’s open question to Architect is withdrawn.']), 'Council, system, optional member failed'),
    failed: article(systemSpeaker, '14:39', card('failed', 'Council failed', ['Frontend’s harness (Codex) exited unexpectedly. Frontend is required, so the council cannot reach consensus. This is a failure, not a lack of consensus.']), 'Council, system, failed')
  };
  const timeline = state => {
    if (state === 'council-member-left') return [...firstRound({ kind: 'withdrawn', label: 'Withdrawn' }), outcomes.left];
    if (state === 'council-failed') return [...firstRound({ kind: 'unresolved', label: 'Unresolved' }), outcomes.failed];
    const feed = [...firstRound({ kind: 'answered', label: 'Answered 14:41' }), ...secondRound()];
    return state === 'council-consensus' ? [...feed, outcomes.consensus] : feed;
  };
  const roster = left => `<div class="council-roster" role="list" aria-label="Members">${cast.map(item => `<span class="council-roster-item" role="listitem"><span class="backend-dot ${item.backend}" aria-hidden="true"></span><strong>${esc(item.name)}</strong><span>${esc(item.role)}</span>${left.includes(item.name) ? '<span class="council-left">Left</span>' : ''}</span>`).join('')}</div>`;

  HF.councilActivity = (state = 'council') => {
    const summary = HF.councilRunSummary(state);
    return `<div class="wfr-council" data-council-state="${esc(state)}"><header class="wfr-council-head"><strong>Council</strong><span class="council-phase">${esc(summary.header)}</span><span class="spacer"></span><button type="button" class="quiet" data-action="wr-deselect" aria-label="Close selected activity">×</button></header>${roster(summary.left)}
    <div class="wfr-council-feed" id="council-feed" tabindex="0" role="region" aria-label="Council discussion, one feed">${timeline(state).join('')}</div></div>`;
  };
})();
