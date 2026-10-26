// Exploratory motion reference for HarflowMac #20; no engine or native-view simulation.
(() => {
  const defaults = () => ({ loaded: false, outcome: 'populated', motion: 'system', updates: 0 });
  const state = () => HF.skeletonCrossfadeState ??= defaults();
  const reduced = value => value.motion === 'reduced' || (value.motion === 'system'
    && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function result(value) {
    if (value.outcome === 'empty') return '<div class="crossfade-outcome"><h3>No activity yet</h3><p class="muted">An empty result uses the same handoff.</p></div>';
    if (value.outcome === 'error') return '<div class="crossfade-outcome"><h3>Activity unavailable</h3><p class="muted">A read failure replaces loading in the same viewport.</p></div>';
    return `<div class="crossfade-outcome"><p class="caption">ACTIVITY · MOCK FIXTURE</p><h3>Session reliability</h3><p>The loaded view arrives as the skeleton leaves.</p><div class="crossfade-detail">Read · ActivityFeed.swift</div><p class="muted" data-crossfade-update>${value.updates ? `Content update ${value.updates} · no repeat fade` : 'Ready to inspect'}</p><button type="button" data-crossfade-action="preview">Preview action</button></div>`;
  }

  HF.renderSkeletonCrossfade = () => {
    const value = state();
    return HF.app(`<div class="foundations scroll skeleton-crossfade-reference" data-skeleton-crossfade>
      <section><p class="caption">EXPLORATORY · HARFLOWMAC #20</p><h2>Loading handoff</h2><p class="muted">One opacity crossfade, one stable viewport. No scale, translation, or second arrival animation.</p></section>
      <section class="crossfade-controls" aria-label="Motion preview controls">
        <label>Resolved outcome<select data-crossfade-control="outcome">${['populated','empty','error'].map(v => `<option value="${v}" ${value.outcome === v ? 'selected' : ''}>${v[0].toUpperCase() + v.slice(1)}</option>`).join('')}</select></label>
        <label>Reduce Motion<select data-crossfade-control="motion">${[['system','Follow system'],['full','Off'],['reduced','On — instant swap']].map(([v,label]) => `<option value="${v}" ${value.motion === v ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        <button type="button" data-crossfade-action="load" ${value.loaded ? 'disabled' : ''}>Load selected outcome</button>
        <button type="button" data-crossfade-action="update" ${value.loaded ? '' : 'disabled'}>Update without refading</button>
        <button type="button" data-crossfade-action="reset">Replay loading</button>
      </section>
      <section><div class="crossfade-frame" data-crossfade-frame data-loaded="${value.loaded}" data-reduced="${reduced(value)}" aria-busy="${!value.loaded}">
        <div class="crossfade-layer crossfade-skeleton" aria-hidden="true" inert><i></i><i></i><i></i><i></i></div>
        <div class="crossfade-layer crossfade-result" ${value.loaded ? '' : 'inert'} aria-hidden="${!value.loaded}">${result(value)}</div>
      </div><p class="caption crossfade-status" role="status" aria-live="polite" data-crossfade-status>${value.loaded ? 'Resolved — content updates and appearance changes do not replay the fade.' : 'Loading fixture — choose Load selected outcome to see the handoff.'}</p></section>
      <section class="crossfade-rules"><h3>Proposed motion rule</h3><dl><dt>Timing</dt><dd>180 ms ease-out, matching HfMotion.arrival.</dd><dt>Layers</dt><dd>Skeleton fades from 1 → 0 while content fades from 0 → 1 in the same interval.</dd><dt>Reduce Motion</dt><dd>Instant replacement. An explicit override takes precedence over the system setting.</dd><dt>Repeat behavior</dt><dd>Once per retained selection. Streaming, pagination, viewport reentry and appearance changes do not replay it.</dd><dt>Interaction</dt><dd>The decorative skeleton is never interactive or exposed to accessibility. Prepared content becomes available when the handoff starts.</dd></dl></section>
      <section><h3>Native boundaries</h3><p>The native sidebar keeps its existing AppKit row reconciliation and disclosure/fading pipeline; it does not gain an overlapping skeleton row.</p><p>Inline content retains its natural layout. An empty Files edited result still omits that section; no new empty message or permanent blank space is proposed. The crossfade must not animate geometry or retain the skeleton’s larger layout footprint and collapse it later.</p><p class="caption">This fixed-size demo demonstrates a viewport handoff. Native inline-size changes caused by actual results remain distinct from motion introduced by the transition.</p></section>
      <section><h3>Source and scope</h3><p>Based on <a href="https://github.com/Harflow-Dev/HarflowMac/blob/2e2d3c200cc5bfb751763f8ff96e984d7dbfa96a/macos/HfFoundation/HfUI/Sources/HfUI/Style/HfMotion.swift" target="_blank" rel="noreferrer">HarflowMac 2e2d3c2 · HfMotion.swift</a>. Browser timing and compositing approximate native SwiftUI rendering; this is a proposed rule, not native fidelity or performance evidence.</p></section>
    </div>`);
  };

  function sync(root) {
    const value = state();
    const frame = root.querySelector('[data-crossfade-frame]');
    frame.dataset.reduced = String(reduced(value));
    frame.dataset.loaded = String(value.loaded);
    frame.setAttribute('aria-busy', String(!value.loaded));
    const content = root.querySelector('.crossfade-result');
    content.inert = !value.loaded;
    content.setAttribute('aria-hidden', String(!value.loaded));
    root.querySelector('[data-crossfade-action="load"]').disabled = value.loaded;
    root.querySelector('[data-crossfade-action="update"]').disabled = !value.loaded;
  }

  HF.afterSkeletonCrossfadeRender = () => {
    const root = document.querySelector('[data-skeleton-crossfade]');
    if (!root) { HF.skeletonCrossfadeState = null; return; }
    sync(root);
  };

  document.addEventListener('click', event => {
    const button = event.target?.closest?.('[data-crossfade-action]');
    if (!button || button.disabled) return;
    const root = button.closest('[data-skeleton-crossfade]');
    if (!root) return;
    const value = state();
    const status = root.querySelector('[data-crossfade-status]');
    switch (button.dataset.crossfadeAction) {
      case 'load':
        value.loaded = true;
        sync(root);
        status.textContent = reduced(value) ? 'Resolved instantly — Reduce Motion is on.' : 'Resolved — 180 ms opacity crossfade; later updates do not refade.';
        break;
      case 'reset': {
        const frame = root.querySelector('[data-crossfade-frame]');
        frame.classList.add('crossfade-resetting');
        value.loaded = false;
        value.updates = 0;
        root.querySelector('.crossfade-result').innerHTML = result(value);
        sync(root);
        void frame.offsetWidth;
        frame.classList.remove('crossfade-resetting');
        status.textContent = 'Loading fixture — ready to replay.';
        break;
      }
      case 'update':
        value.updates += 1;
        root.querySelector('.crossfade-result').innerHTML = result(value);
        status.textContent = 'Content updated in place; no opacity animation was started.';
        break;
      case 'preview': status.textContent = 'Mock action selected. No engine command is run.'; break;
    }
  });

  document.addEventListener('change', event => {
    const input = event.target?.closest?.('[data-crossfade-control]');
    const root = input?.closest('[data-skeleton-crossfade]');
    if (!root) return;
    const value = state();
    if (input.dataset.crossfadeControl === 'outcome' && ['populated','empty','error'].includes(input.value)) {
      value.outcome = input.value;
      root.querySelector('.crossfade-result').innerHTML = result(value);
    } else if (input.dataset.crossfadeControl === 'motion' && ['system','full','reduced'].includes(input.value)) {
      value.motion = input.value;
    }
    sync(root);
  });
})();
