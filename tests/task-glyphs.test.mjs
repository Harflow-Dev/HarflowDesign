import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const v2 = path.join(root, 'v2');
const read = file => fs.readFileSync(path.join(v2, file), 'utf8');
function loadRuntime() {
  const context = vm.createContext({ window: {} });
  context.window = context;
  const scripts = fs.readdirSync(path.join(v2, 'scripts')).filter(name => name !== 'catalog.js');
  for (const name of ['registry.js', ...scripts.filter(name => name !== 'registry.js')]) vm.runInContext(read(path.join('scripts', name)), context, { filename: name });
  return context.HFV2;
}
const HFV2 = loadRuntime();
const T = HFV2.templates;
// A glyph span with its optional single icon child: [whole, class list, aria-label, icon class or ''].
const GLYPH = /<span class="(hd-glyph[^"]*)"[^>]*?aria-label="([^"]*)"[^>]*>(?:<span class="(hd-i[^"]*)"[^>]*><\/span>)?<\/span>/g;
const glyphs = html => Array.from(html.matchAll(GLYPH), m => ({ cls: m[1], label: m[2], icon: m[3] || '' }));
const has = (g, cls, icon) => g.cls.split(' ').includes(cls) && (icon ? g.icon.split(' ').includes(icon) : g.icon === '');

test('the menu bar running workflow row is a spinner with no icon inside', () => {
  assert.ok(T['menu-bar/busy'].includes('<span class="hd-glyph hd-glyph--running" aria-label="Workflow run, running"></span>'));
  const g = glyphs(T['menu-bar/busy']);
  assert.ok(g.some(x => x.label === 'Workflow run, running' && has(x, 'hd-glyph--running')));
  for (const x of g.filter(x => /running/i.test(x.label) && x.cls.includes('hd-glyph--running'))) assert.equal(x.icon, '', x.label);
  assert.ok(!g.some(x => /running/.test(x.label) && x.icon.includes('hd-i-workflow')));
});
test('running is always a spinner: no workflow icon in any running-labelled element of any template', () => {
  let checked = 0;
  for (const [route, html] of Object.entries(T)) {
    if (typeof html !== 'string') continue;
    for (const m of html.matchAll(/<[a-z]+\b[^>]*aria-label="([^"]*)"[^>]*>(?:(?!<\/span>)[\s\S])*<\/span>/g)) {
      if (!/^(Running|.*, running)$/.test(m[1])) continue;
      checked++;
      assert.ok(!m[0].includes('hd-i-workflow'), route + ': ' + m[1]);
    }
  }
  assert.ok(checked > 0);
  // Running parallel groups keep the parallel icon in the active glyph.
  assert.ok(Object.values(T).some(h => typeof h === 'string' && glyphs(h).some(x => x.label === 'Parallel group, running' && has(x, 'hd-glyph--active', 'hd-i-parallel'))));
});
test('Timed out is the failed x in the status badge', () => {
  const html = T['components/status-badge'];
  assert.ok(html.includes('<span class="hd-badge hd-badge--failed"><span class="hd-i hd-i-x" aria-hidden="true"></span>Timed out</span>'));
  const badges = Array.from(html.matchAll(/<span class="hd-badge[^"]*">[\s\S]*?<\/span>[^<]*<\/span>/g), m => m[0]);
  assert.ok(badges.filter(b => b.includes('Timed out')).every(b => !b.includes('hd-i-clock')));
  assert.ok(!/hd-i-clock[^<]*<\/span>\s*Timed out/.test(html));
});
test('the proposal source maps timedOut to the x icon and never a clock', () => {
  const src = read('scripts/m05-proposal.js');
  const entries = src.match(/timedOut:\s*\[[^\]]*\]/g) || [];
  assert.ok(entries.length > 0);
  for (const e of entries) assert.doesNotMatch(e, /clock/i);
  assert.match(src, /timedOut: \['hd-badge--failed', icon\('x', false\), 'Timed out/);
  assert.ok(src.includes("timedOut: ['failed', 'Timed out', 'x']"));
});
// The decision names new-task/centered-ready; the entry renderer (m04-proposal.js) draws that state's sidebar from the
// new-task/default template, so its rows are the canonical ones.
test('the canonical sidebar rows use the agreed glyph set', () => {
  const g = glyphs(T['new-task/default']);
  const find = label => g.filter(x => x.label === label);
  const EXPECT = [['Running', 'hd-glyph--running', ''], ['Needs you', 'hd-glyph--attention', 'hd-i-hand'], ['Failed', 'hd-glyph--failed', 'hd-i-x'], ['Cancelled', 'hd-glyph--cancelled', 'hd-i-stop'], ['Parallel group, running', 'hd-glyph--active', 'hd-i-parallel']];
  for (const [label, cls, icon] of EXPECT) {
    const rows = find(label);
    assert.ok(rows.length > 0, label + ' row present');
    assert.ok(rows.every(x => has(x, cls, icon)), label);
  }
  // Done is the check; a finished workflow run is the workflow icon in the same done glyph.
  const done = find('Done');
  assert.ok(done.some(x => has(x, 'hd-glyph--done', 'hd-i-check')) && done.some(x => has(x, 'hd-glyph--done', 'hd-i-workflow')));
  assert.ok(done.every(x => has(x, 'hd-glyph--done', 'hd-i-check') || has(x, 'hd-glyph--done', 'hd-i-workflow')));
});

test('the SidebarTaskRow guidelines and colour roles follow the canonical glyphs', () => {
  const guide = HFV2.componentDocs['components/sidebar-task-row'];
  assert.ok(!/Workflow runs follow the same rule/.test(guide), 'workflow runs are no longer tinted by status');
  assert.match(guide, /a running parallel group is the <code>hd-i-parallel<\/code> icon in <code>hd-glyph--active<\/code>, and a finished workflow run is the <code>hd-i-workflow<\/code> icon in <code>hd-glyph--done<\/code>/);
  assert.match(HFV2.componentDocs['components/status-badge'], /<td>Timed out<\/td><td>Red, x/);
  const colour = T['foundations/colour'];
  assert.match(colour, /<code>--danger<\/code>.*?Failed and Timed out glyph/);
  assert.ok(!/<code>--warning<\/code>[^\n]*Timed out/.test(colour), 'timed out is not a warning');
});
