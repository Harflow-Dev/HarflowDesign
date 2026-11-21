import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.createContext(context);
context.window = context;
const scripts = fs.readdirSync(new URL('../v2/scripts/', import.meta.url)).filter(name => name !== 'catalog.js');
for (const name of ['registry.js', ...scripts.filter(name => name !== 'registry.js')]) {
  vm.runInContext(fs.readFileSync(new URL('../v2/scripts/' + name, import.meta.url), 'utf8'), context, { filename: name });
}
const H = context.window.HFV2;

function taskHtml(id) {
  const state = H.m05ProposalStates.find(item => item.id === id);
  assert.ok(state, `M05 fixture ${id} is registered`);
  const ui = H.m05Proposal.initialUi(state.spec);
  const [width, height] = H.m05Proposal.FRAMES[ui.frame];
  return `<div class="hd-m05-window" style="width:${width}px;height:${height}px">${H.m05Proposal.screenHtml(state.spec, ui, 'light', 'light')}</div>`;
}

function composerHtml(id, specOverrides = {}, uiOverrides = {}) {
  const state = H.m05ProposalStates.find(item => item.id === id);
  assert.ok(state, `M05 fixture ${id} is registered`);
  const spec = { ...state.spec, ...specOverrides };
  const ui = { ...H.m05Proposal.initialUi(spec), ...uiOverrides };
  return H.m05Proposal.screenHtml(spec, ui, 'light', 'light');
}

test('root worker approvals stay grouped by request in one scroll flow at both sizes', () => {
  for (const [id, expectedCount, expectedOpen] of [
    ['root-approval-single', 1, 1],
    ['root-approval-five', 5, 1],
    ['root-approval-several', 5, 3]
  ]) {
    for (const suffix of ['', '-minimum']) {
      const route = `workflow-run/${id}${suffix}`;
      const descriptor = H.describe(route);
      assert.equal(descriptor.status, 'provisional', route);
      const html = H.templates[route];
      assert.ok(html.includes('class="hd-root-approvals"'), route);
      assert.equal((html.match(/class="hd-approval hd-root-approval"/g) || []).length, expectedCount, route);
      assert.equal((html.match(/class="hd-approval hd-root-approval" open/g) || []).length, expectedOpen, route);
      assert.equal((html.match(/aria-label="Decision for /g) || []).length, expectedCount, route);
      assert.equal((html.match(/>Approve once<\/button>/g) || []).length, expectedCount, route);
      assert.equal((html.match(/>Reject<\/button>/g) || []).length, expectedCount, route);
      assert.ok(html.indexOf('class="hd-root-approvals"') > html.indexOf('>CONVERSATION</span>'), `${route}: approvals follow conversation`);
      assert.ok(html.indexOf('class="hd-root-approvals"') < html.indexOf('>Dismiss</button>'), `${route}: approvals precede Dismiss`);
      assert.ok(!/overflow-y:\s*(auto|scroll)|max-height:\s*\d+px/.test(html.slice(html.indexOf('class="hd-root-approvals"'), html.indexOf('>Dismiss</button>'))), `${route}: no nested approval scroller`);
      if (suffix) assert.match(html, /width: 1000px; height: 620px;/, route);
      else assert.match(html, /width: 100%; height: 800px;/, route);
    }
  }
});

test('inline Changes identifies rows by turn, repository, scope and path', () => {
  const html = taskHtml('changes-inline');
  const rows = [...html.matchAll(/<details class="hd-m05-inline" data-row-identity="([^"]+)"/g)].map(match => match[1]);
  assert.ok(rows.includes('7be02d91|HarflowWeb|Committed|harflow_web/delivery/queue.py|'));
  assert.ok(rows.includes('7be02d91|HarflowWeb|Working tree|harflow_web/delivery/queue.py|'));
  const committed = rows.find(identity => identity.includes('|Committed|harflow_web/delivery/queue.py|'));
  const working = rows.find(identity => identity.includes('|Working tree|harflow_web/delivery/queue.py|'));
  assert.ok(committed && working && committed !== working, 'same path in separate scopes has distinct row identity');
  assert.equal((html.match(/<details class="hd-m05-inline"/g) || []).length, 6);
  const disclosures = [...html.matchAll(/<details class="hd-m05-inline" data-row-identity="([^"]+)"[\s\S]*?<\/details>/g)];
  const disclosure = identity => disclosures.find(match => match[1] === identity)?.[0] || '';
  assert.match(disclosure('7be02d91|HarflowWeb|Committed|harflow_web/delivery/queue.py|'), /class="hd-m05-status hd-m05-status--modified" title="modified">M<span class="hd-sr"> modified<\/span>/);
  assert.match(disclosure('7be02d91|HarflowWeb|Committed|tests/test_delivery_queue.py|'), /class="hd-m05-status hd-m05-status--added" title="added">A<span class="hd-sr"> added<\/span>/);
  assert.match(html, /<div class="hd-file hd-m05-file"><span class="hd-m05-status hd-m05-status--untracked" title="untracked">\?<span class="hd-sr"> untracked<\/span><\/span><span class="hd-file__path">notes\//);
  assert.match(html, /<div class="hd-file hd-m05-file"><span class="hd-m05-status hd-m05-status--modified" title="modified">M<span class="hd-sr"> modified<\/span><\/span><span class="hd-file__path">assets\/logo\.png/);
  assert.match(html, /<div class="hd-m05-inline__diff">/);
  assert.match(html, /Read 32 KiB of 48 KiB stored/);
  assert.match(html, /Stored text ends here/);
  assert.match(html, /<span class="hd-file__path">notes\/<\/span><span class="hd-m05-rowstate">Directory · name only<\/span>/);
  assert.match(html, /<span class="hd-file__path">assets\/logo\.png<\/span><span class="hd-m05-rowstate">Binary<\/span>/);
  assert.ok(!html.includes('data-row-identity="7be02d91|HarflowWeb|Working tree|notes/'), 'name-only path has no false diff disclosure');
  assert.ok(!html.includes('data-row-identity="7be02d91|HarflowWeb|Working tree|assets/logo.png|'), 'binary path has no false diff disclosure');
});

test('Task inline, Events and running-composer variants are provisional regular and minimum states', () => {
  const ids = ['changes-inline', 'events-result-usage', 'events-usage', 'running-composer-empty', 'running-composer-draft'];
  for (const id of ids) {
    for (const suffix of ['', '-minimum']) {
      const state = H.m05ProposalStates.find(item => item.id === id + suffix);
      assert.ok(state, id + suffix);
      assert.equal(state.kind, 'provisional', id + suffix);
      assert.equal(H.describe(`task/${id}${suffix}`).status, 'provisional', id + suffix);
      const html = taskHtml(id + suffix);
      if (suffix) assert.match(html, /width:1000px;height:620px/);
      else assert.match(html, /width:1280px;height:800px/);
    }
  }
  const usageOnly = taskHtml('events-usage');
  assert.match(usageOnly, /Reported usage/);
  assert.doesNotMatch(usageOnly, /Updated the delivery queue/);
  assert.match(taskHtml('events-result-usage'), /Updated the delivery queue/);
  assert.match(taskHtml('running-composer-empty'), /data-m05-slot[^>]*aria-label="Stop task"/);
  const draft = taskHtml('running-composer-draft');
  assert.match(draft, /data-m05-slot[^>]*aria-label="Send"/);
  assert.match(draft, /data-send-now(?![^>]*hidden)/);
});

test('running composer keeps Send eligibility separate from Stop and lock states', () => {
  const supported = composerHtml('running-composer-draft');
  assert.match(supported, /type="submit"[^>]*data-m05-slot[^>]*aria-label="Send"/);
  assert.match(supported, /data-send-now(?![^>]*hidden)/);
  assert.doesNotMatch(supported, /<textarea[^>]*disabled/);

  const unsupported = composerHtml('running-composer-draft', { messagingSupported: false });
  assert.match(unsupported, /<textarea[^>]*disabled/);
  assert.match(unsupported, /type="button"[^>]*data-m05-slot[^>]*data-m05="stop"[^>]*aria-label="Stop task"/);
  assert.match(unsupported, /data-send-now[^>]*hidden/);
  assert.doesNotMatch(unsupported, /type="submit"[^>]*data-m05-slot/);

  const whitespace = composerHtml('running-composer-draft', {}, { draft: ' \n\t ' });
  assert.match(whitespace, /type="button"[^>]*data-m05-slot[^>]*data-m05="stop"[^>]*aria-label="Stop task"/);
  assert.match(whitespace, /data-send-now[^>]*hidden/);
  assert.doesNotMatch(whitespace, /type="submit"[^>]*data-m05-slot/);

  const stopping = composerHtml('running-composer-draft', {}, { stopping: true });
  assert.match(stopping, /<textarea[^>]*disabled/);
  assert.match(stopping, /type="button"[^>]*data-m05-slot[^>]*aria-disabled="true"[^>]*aria-label="Stopping…"/);
  assert.match(stopping, /data-send-now[^>]*hidden/);
  assert.doesNotMatch(stopping, /type="submit"[^>]*data-m05-slot/);
});
