(() => {
  const $ = id => document.getElementById(id);
  function render() {
    const state = $('state').value, surface = $('surface').value;
    $('notices').hidden = ['continuity', 'none'].includes($('rows').value);
    $('continuity-row').hidden = ['notices', 'none'].includes($('rows').value);
    $('title').textContent = surface === 'Task' ? 'Continuity verification fixture' : surface;
    $('composer-label').textContent = surface === 'Workflow editor' ? 'Message the workflow builder' : `Message this ${surface.toLowerCase()}`;
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
