(function () {
  // Exploratory Council run activity (#17): one feed in which every output names the agent that produced it.
  // A member is an agent; the harness is secondary text and is never the speaker.
  const esc = HF.escape;
  const members = [
    { name: 'Dana', role: 'Facilitator', backend: 'claude' },
    { name: 'Noor', role: 'Member', backend: 'codex' },
    { name: 'Iris', role: 'Member', backend: 'vibe' }
  ];
  HF.councilRunSummary = { line: '3 members · round 2 of 5', phase: 'Consensus on v2' };
  const harness = backend => `<span class="council-harness"><span class="backend-dot ${backend}" aria-hidden="true"></span>${esc(HF.harnessName(backend))}</span>`;
  const speaker = member => `<header class="council-speaker"><strong>${esc(member.name)}</strong><span class="council-role">${esc(member.role)}</span>${harness(member.backend)}</header>`;
  const by = name => members.find(member => member.name === name);
  const vote = (kind, text) => `<span class="council-chip ${kind}"><span aria-hidden="true">${kind === 'accept' ? '✓' : kind === 'object' ? '✕' : kind === 'reset' ? '↺' : '…'}</span> ${esc(text)}</span>`;
  const round = label => `<div class="council-round" role="separator" aria-label="${esc(label)}"><span>${esc(label)}</span></div>`;
  const candidate = (version, text, supersedes) => `<div class="council-candidate"><div class="council-candidate-head"><strong>Candidate v${version}</strong>${supersedes ? `<span class="council-role">Supersedes v${supersedes}</span>` : ''}</div><p>${esc(text)}</p></div>`;
  const question = (from, to, about, text, disposition) => `<div class="council-question"><div class="council-question-head"><span>${esc(from)} → ${esc(to)} · about ${esc(about)}</span><span class="council-chip disposition ${disposition}">${esc(disposition[0].toUpperCase() + disposition.slice(1))}</span></div><p>${esc(text)}</p></div>`;

  HF.councilActivity = () => `<div class="wfr-council"><header class="wfr-council-head"><strong>Council</strong><span class="spacer"></span><button type="button" class="link" data-action="wr-council-jump">Go to outcome</button><button type="button" class="quiet" data-action="wr-deselect" aria-label="Close selected activity">×</button></header>
    <div class="wfr-council-feed" id="council-feed" tabindex="0" role="region" aria-label="Council discussion, one feed">
      <p class="council-members">${members.map(member => `<span><strong>${esc(member.name)}</strong> · ${esc(member.role)} · ${esc(HF.harnessName(member.backend))}</span>`).join('')}</p>
      ${round('Round 1 of 5 · 14:36')}
      <article class="council-turn">${speaker(by('Dana'))}<p>First candidate for the retry policy.</p>${candidate(1, 'Retry with exponential backoff and an idempotency key.')}</article>
      <article class="council-turn">${speaker(by('Noor'))}<p>I object to v1: no upper bound.</p><div class="council-votes">${vote('object', 'Objects to v1')}</div></article>
      <article class="council-turn">${speaker(by('Iris'))}${question('Iris', 'Noor', 'Candidate v1', 'Which failures count toward the bound?', 'answered')}</article>
      <article class="council-turn">${speaker(by('Noor'))}<p>Only retryable errors count.</p></article>
      ${round('Round 2 of 5 · 14:41')}
      <article class="council-turn">${speaker(by('Dana'))}<p>Here is v2 with a bound.</p>${candidate(2, 'At most 5 attempts, keyed by refund id.', 1)}<div class="council-votes">${vote('reset', 'Prior acceptances reset')}</div></article>
      <article class="council-turn">${speaker(by('Noor'))}<p>v2 addresses my objection.</p></article>
      <div class="council-votes tally" role="group" aria-label="Votes on Candidate v2">${vote('accept', 'Dana accepts v2')}${vote('accept', 'Noor accepts v2')}${vote('accept', 'Iris accepts v2')}</div>
      <section class="council-outcome consensus" id="council-outcome" tabindex="-1" aria-labelledby="council-outcome-title"><h3 id="council-outcome-title">Consensus reached on Candidate v2</h3><p><strong>Conclusion:</strong> At most 5 attempts, keyed by refund id.</p><p><strong>Rationale:</strong> Every member accepted the exact text of v2.</p><p><strong>Caveats:</strong> The bound has not been load tested.</p></section>
    </div></div>`;
})();
