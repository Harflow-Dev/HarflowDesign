(() => {
  const $ = id => document.getElementById(id);
  function render() {
    const state = $('state').value, surface = $('surface').value;
    $('notices').hidden = ['continuity', 'none'].includes($('rows').value);
    $('continuity-row').hidden = ['notices', 'none'].includes($('rows').value);
    const isRun = surface === 'Workflow run', selected = ['Node task', 'Orchestrator Activity'].includes(surface), parallel = surface === 'Parallel';
    $('work-layout').className = selected ? 'selected-layout' : parallel ? 'parallel-layout' : '';
    $('workflow-canvas').hidden = !(isRun || selected);
    $('activity-panel').hidden = isRun;
    $('activity-title').hidden = !(selected || parallel);
    $('activity-title').textContent = surface === 'Orchestrator Activity' ? 'Orchestrator · Activity' : parallel ? 'Implementation · Activity' : 'Selected node · Activity';
    $('parallel-panel').hidden = !parallel;
    $('parallel-panel').innerHTML = parallel ? '<h3>Review · Activity</h3><p>Independent node activity and message target.</p><form><label>Message this review node<textarea placeholder="Queue a message to review…"></textarea></label><button type="submit">Send</button><button type="button" class="parallel-now">Send now</button><p class="parallel-result" role="status"></p></form>' : '';
    if (parallel) { const panel = $('parallel-panel'), form = panel.querySelector('form'); form.onsubmit = event => { event.preventDefault(); panel.querySelector('.parallel-result').textContent = 'Queued for Review: ' + panel.querySelector('textarea').value; }; panel.querySelector('.parallel-now').onclick = () => { panel.querySelector('.parallel-result').textContent = 'Review cannot be interrupted safely. Its message stays queued.'; }; }
    $('title').textContent = surface === 'Task' ? 'Continuity verification fixture' : surface;
    $('composer-label').textContent = surface === 'Workflow editor' ? 'Message the workflow builder' : surface === 'Orchestrator Activity' ? 'Message the orchestrator' : ['Node task', 'Parallel'].includes(surface) ? 'Message this node' : 'Message this task';
    $('recovery').hidden = !['attention', 'child'].includes(state);
    $('root').hidden = state !== 'child';
    $('refusal').textContent = state === 'child' ? 'Open the root workflow to request control of this child run.' : 'Original caller is alive. Harflow cannot resume this checkpoint.';
    $('queue').hidden = !['queued', 'refused'].includes(state);
    $('result').textContent = state === 'refused' ? 'Immediate delivery unavailable: the current operation cannot be interrupted safely. Your message stays queued.' : '';
    $('hint').textContent = state === 'unsupported' ? 'This engine does not support workflow messaging. Update the managed engine to use this action.' : state === 'loading' ? 'Checking message eligibility…' : 'Send queues the message. Send now requests immediate delivery; an engine refusal keeps it queued.';
    $('send').disabled = $('now').disabled = ['unsupported', 'loading'].includes(state);
    $('continuity').textContent = state === 'long' ? 'Server restarted · Task still running. Supervision remains active while this longer continuity explanation wraps onto another line at narrow widths.' : 'Server restarted · Task still running';
    $('message').disabled = ['unsupported', 'loading'].includes(state);
  }
  $('select-orchestrator').onclick = () => { $('surface').value = 'Orchestrator Activity'; render(); };
  $('select-node').onclick = () => { $('surface').value = 'Node task'; render(); };
  $('theme').onchange = () => { document.documentElement.dataset.theme = $('theme').value; };
  $('surface').onchange = $('state').onchange = $('rows').onchange = render;
  $('composer').onsubmit = event => { event.preventDefault(); if (!$('message').value.trim()) return; $('queued-text').textContent = 'Queued: ' + $('message').value; $('queue').hidden = false; $('message').value = ''; $('result').textContent = 'Message queued.'; };
  $('now').onclick = () => { if (!$('message').value.trim()) return; $('queued-text').textContent = 'Queued: ' + $('message').value; $('queue').hidden = false; $('message').value = ''; $('result').textContent = 'Immediate delivery unavailable: pending approval. Your message stays queued.'; };
  $('cancel').onclick = () => { $('queue').hidden = true; $('result').textContent = 'Queued message cancelled.'; };
  $('notices').onclick = $('details').onclick = () => { $('result').textContent = 'Inspector: 2 notices; restart supervision remains active.'; };
  $('root').onclick = () => { $('result').textContent = 'Open the owning root workflow to request control.'; };
  $('reset').onclick = () => { $('surface').value = 'Task'; $('state').value = 'ready'; $('rows').value = 'both'; $('message').value = ''; render(); };
  render();
})();
