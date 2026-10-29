(() => {
  const $ = id => document.getElementById(id);
  const LONG = 'Check the recovery evidence before continuing. Compare the ledger with yesterday\'s run, keep the exact figures, and do not retry a step that already finished. If a line is missing, say which one and stop.';
  let extras = [];
  let expanded = new Set();

  const captionFor = status => status === 'undeliverable' ? 'Undeliverable' : status === 'uncertain' ? 'Delivery uncertain' : status === 'delivered' ? '' : 'Queued';
  const pending = status => status === 'queued' || status === 'delivering';

  const esc = value => String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  function bubble(item) {
    const caption = captionFor(item.status);
    const long = item.text.length > 180;
    const open = expanded.has(item.id);
    return `<article class="q-bubble${pending(item.status) ? ' pending' : ''}" data-id="${esc(item.id)}">
      ${caption ? `<p class="q-caption">${caption}</p>` : ''}
      <p class="q-text${long && !open ? ' clamped' : ''}">${esc(item.text)}</p>
      ${item.note ? `<p class="q-note">${esc(item.note)}</p>` : ''}
      ${long || item.status === 'queued' ? `<div class="q-actions">${long ? `<button type="button" class="q-more" data-id="${esc(item.id)}">${open ? 'Show less' : 'Show more'}</button>` : ''}${item.status === 'queued' ? '<button type="button" class="q-cancel" aria-label="Cancel queued message">Cancel</button>' : ''}</div>` : ''}
    </article>`;
  }

  function prescribed(state) {
    const one = { id: 'm1', text: 'Check the recovery evidence before continuing.', status: 'queued' };
    const two = { id: 'm2', text: 'Also compare it with yesterday\'s run.', status: 'queued' };
    if (state === 'queued') return [one];
    if (['queued-several', 'streaming', 'scrolled'].includes(state)) return [one, two];
    if (state === 'delivering') return [{ ...one, status: 'delivering' }];
    if (state === 'delivered') return [{ ...one, status: 'delivered' }];
    if (state === 'refused') return [{ ...one, note: 'Send now isn\'t available. This operation can\'t be interrupted safely.' }];
    if (state === 'undeliverable') return [{ ...one, status: 'undeliverable', note: 'The workflow ended before this message could be delivered.' }];
    if (state === 'uncertain') return [{ ...one, status: 'uncertain', note: 'The spawn was interrupted. Delivery was not confirmed.' }];
    if (state === 'queued-long') return [{ id: 'm1', text: LONG, status: 'queued' }];
    return [];
  }

  function items() {
    const state = $('state').value;
    return state === 'ready' ? extras : prescribed(state).concat(state === 'ready' ? [] : extras);
  }

  function paint(root, list) {
    root.innerHTML = list.map(bubble).join('');
    root.querySelectorAll('.q-cancel').forEach(button => {
      button.onclick = () => {
        const article = button.closest('.q-bubble');
        const remove = () => { article.remove(); $('result').textContent = 'Queued message cancelled.'; };
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) remove();
        else { article.classList.add('leaving'); setTimeout(remove, 180); }
      };
    });
    root.querySelectorAll('.q-more').forEach(button => {
      button.onclick = () => {
        if (expanded.has(button.dataset.id)) expanded.delete(button.dataset.id);
        else expanded.add(button.dataset.id);
        render();
      };
    });
  }

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
    $('title').textContent = surface === 'Task' ? 'Continuity verification fixture' : surface;
    $('composer-label').textContent = surface === 'Orchestrator Activity' ? 'Message the orchestrator' : ['Node task', 'Parallel'].includes(surface) ? 'Message this node' : 'Message this task';
    $('recovery').hidden = !['attention', 'child'].includes(state);
    $('root').hidden = state !== 'child';
    $('refusal').textContent = state === 'child' ? 'Open the root workflow to request control of this child run.' : 'Original caller is alive. Harflow cannot resume this checkpoint.';
    const list = isRun ? [] : items();
    const queuedCount = list.filter(item => item.status === 'queued' || item.status === 'delivering').length;
    $('stream').hidden = state !== 'streaming' && state !== 'scrolled';
    $('reply').hidden = state !== 'delivered';
    $('history').innerHTML = state === 'scrolled' ? '<p>Earlier activity stays put while you read it.</p><p>The agent listed the files it opened.</p><p>A tool finished before the queue.</p>' : '';
    $('activity').classList.toggle('is-scrolled', state === 'scrolled');
    paint($('bubbles'), list);
    $('jump').hidden = state !== 'scrolled';
    $('jump').textContent = queuedCount === 1 ? 'Queued message' : 'Queued messages';
    $('result').textContent = state === 'cancelled' ? 'Queued message cancelled.' : '';
    $('hint').textContent = state === 'unsupported' ? 'This engine does not support workflow messaging. Update the managed engine to use this action.' : state === 'loading' ? 'Checking message eligibility…' : 'Send queues the message. Send now requests immediate delivery; an engine refusal keeps it queued.';
    $('send').disabled = $('now').disabled = ['unsupported', 'loading'].includes(state) || isRun;
    $('continuity').textContent = state === 'long' ? 'Server restarted · Task still running. Supervision remains active while this longer continuity explanation wraps onto another line at narrow widths.' : 'Server restarted · Task still running';
    $('message').disabled = ['unsupported', 'loading'].includes(state) || isRun;
    document.querySelector('main').style.maxWidth = $('width').value + 'px';
    const panel = $('parallel-panel');
    panel.hidden = !parallel;
    if (parallel) {
      const review = list.map(item => ({ ...item, id: 'r-' + item.id, text: item.id === 'm2' ? 'Look at the diff before approving.' : item.text }));
      panel.innerHTML = `<h3>Review · Activity</h3><section class="activity"><p>Independent node activity and message target.</p><div class="q-thread">${review.map(bubble).join('')}</div><form id="parallel-form"><label>Message this review node<textarea placeholder="Queue a message to review…"></textarea></label><div class="input-row"><button type="submit" id="parallel-send">Send</button><button type="button" id="parallel-now">Send now</button></div><p class="parallel-result" role="status"></p></form></section>`;
      panel.querySelectorAll('.q-cancel').forEach(button => { button.onclick = () => button.closest('.q-bubble').remove(); });
      const form = panel.querySelector('#parallel-form');
      const add = note => {
        const text = form.querySelector('textarea').value.trim();
        if (!text) return;
        form.querySelector('textarea').value = '';
        const host = panel.querySelector('.q-thread');
        host.insertAdjacentHTML('beforeend', bubble({ id: 'live-' + host.children.length, text, status: 'queued', note }));
        form.querySelector('.parallel-result').textContent = note ? 'Review cannot be interrupted safely. Its message stays queued.' : 'Message queued.';
      };
      form.onsubmit = event => { event.preventDefault(); add(''); };
      panel.querySelector('#parallel-now').onclick = () => add('Send now isn\'t available. This operation can\'t be interrupted safely.');
    }
    if (state === 'scrolled') $('activity').scrollTop = 0;
  }

  function queue(note) {
    const text = $('message').value.trim();
    if (!text) return;
    $('state').value = 'ready';
    extras.push({ id: 'live-' + extras.length, text, status: 'queued', note });
    $('message').value = '';
    render();
    $('result').textContent = note ? 'Immediate delivery unavailable: the current operation cannot be interrupted safely. Your message stays queued.' : 'Message queued.';
  }

  $('select-orchestrator').onclick = () => { $('surface').value = 'Orchestrator Activity'; render(); };
  $('select-node').onclick = () => { $('surface').value = 'Node task'; render(); };
  $('theme').onchange = () => { document.documentElement.dataset.theme = $('theme').value; };
  $('surface').onchange = $('state').onchange = $('rows').onchange = $('width').onchange = () => { if ($('state').value !== 'ready') extras = []; render(); };
  $('composer').onsubmit = event => { event.preventDefault(); queue(''); };
  $('now').onclick = () => queue('Send now isn\'t available. This operation can\'t be interrupted safely.');
  $('jump').onclick = () => { $('bubbles').scrollIntoView({ block: 'nearest' }); };
  $('notices').onclick = $('details').onclick = () => { $('result').textContent = 'Inspector: 2 notices; restart supervision remains active.'; };
  $('root').onclick = () => { $('result').textContent = 'Open the owning root workflow to request control.'; };
  $('reset').onclick = () => { extras = []; expanded = new Set(); $('surface').value = 'Task'; $('state').value = 'ready'; $('rows').value = 'both'; $('width').value = '1200'; $('message').value = ''; render(); };
  render();
})();
