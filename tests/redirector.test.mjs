import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = /<script>([\s\S]*?)<\/script>/.exec(html)[1];

// Runs the inline script of the root page against a fake location. Returns the target it
// replaces the location with, or null when it stays on the page (the link stub).
function run({ protocol = 'https:', pathname, search = '', hash = '' }) {
  let target = null;
  const location = { protocol, pathname, search, hash, replace(url) { target = url; } };
  const document = { addEventListener() {}, querySelectorAll() { return []; } };
  vm.runInNewContext(script, { window: { location }, document });
  return target;
}

// The host serves a file or a directory with an index.html as itself, and the root page,
// with status 200, for every other path (including directories without an index).
function servedAsItself(urlPath) {
  const fsPath = path.join(root, decodeURIComponent(urlPath.split(/[?#]/)[0]).replace(/^\/+/, ''));
  if (urlPath === '/' || urlPath === '/index.html') return false; // the redirector itself
  if (fs.existsSync(fsPath) && fs.statSync(fsPath).isFile()) return true;
  return fs.existsSync(path.join(fsPath, 'index.html'));
}

// Follows redirects the way a browser would and returns the final URL and whether it ends on
// the link stub. Fails if a redirect is followed more than twice (a loop).
function follow(start) {
  let current = start;
  for (let step = 0; step < 3; step += 1) {
    const url = new URL(current.pathname + current.search + current.hash, 'https://design.example');
    const target = run({ protocol: 'https:', pathname: url.pathname, search: url.search, hash: url.hash });
    if (target === null) return { final: url.pathname + url.hash, stub: true, steps: step };
    assert.ok(target.startsWith('/'), `${current.pathname} redirects to a root-absolute path, got ${target}`);
    const next = new URL(target, 'https://design.example');
    if (servedAsItself(next.pathname)) return { final: next.pathname + next.hash, stub: false, steps: step + 1 };
    current = { pathname: next.pathname, search: next.search, hash: next.hash };
  }
  assert.fail(`${start.pathname} redirects without end`);
}

const cases = [
  ['/', '', '/v2/index.html', false],
  ['/index.html', '', '/v2/index.html', false],
  ['/', '#x', '/archive/v1/index.html#x', false],
  ['/features/', '', '/archive/v1/features/', true],
  ['/features/needs-you.html', '', '/archive/v1/features/needs-you.html', false],
  ['/features/needs-you', '', '/archive/v1/features/needs-you', true],
  ['/docs/', '', '/archive/v1/docs/', true],
  ['/docs/x.md', '', '/archive/v1/docs/x.md', true],
  ['/docs/loading-handoff.md', '', '/archive/v1/docs/loading-handoff.md', false],
  ['/scripts/', '', '/archive/v1/scripts/', true],
  ['/scripts/catalog.js', '', '/archive/v1/scripts/catalog.js', false],
  ['/v2/', '', '/v2/', null],
  ['/v2/docs/', '', '/v2/docs/', true],
  ['/v2/docs/approval.md', '', '/v2/docs/decisions/approval.md', false],
  ['/v2/docs/approval.md', '#x', '/v2/docs/decisions/approval.md#x', false],
  ['/v2/docs/m05-task-screen-proposal.md', '', '/v2/docs/decisions/m05-task-screen-proposal.md', false],
  ['/archive/', '', '/archive/', true],
  ['/archive/v1/scripts/', '', '/archive/v1/scripts/', true],
  ['/a/b/index.html', '', '/archive/v1/a/b/index.html', true]
];

for (const [pathname, hash, final, stub] of cases) {
  test(`served ${pathname}${hash} ends without a loop`, () => {
    if (stub === null) {
      assert.ok(servedAsItself(pathname), `${pathname} is a real page, so the root page is not involved`);
      return;
    }
    const result = follow({ pathname, search: '', hash });
    assert.equal(result.final, final);
    assert.equal(result.stub, stub);
    assert.ok(result.steps <= 2);
  });
}

test('every moved document redirects to an existing decisions file', () => {
  const moved = [...script.matchAll(/'(\/v2\/docs\/[a-z0-9-]+\.md)': '(\/v2\/docs\/decisions\/[a-z0-9-]+\.md)'/g)];
  assert.equal(moved.length, 7);
  const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
  for (const [, from, to] of moved) {
    assert.ok(!fs.existsSync(path.join(root, from)), `${from} no longer exists`);
    assert.ok(fs.existsSync(path.join(root, to)), `${to} exists`);
    assert.ok(redirects.includes(`${from} ${to} 301`), `${from} is also in _redirects`);
  }
});

test('a missing path inside v2 or archive never navigates', () => {
  for (const pathname of ['/v2/x', '/v2/docs/missing.md', '/archive/v1/missing', '/archive']) assert.equal(run({ pathname }), null, pathname);
});

test('file:// targets are relative and keep the hash', () => {
  const file = { protocol: 'file:', pathname: '/Users/x/HarflowDesign/index.html' };
  assert.equal(run(file), 'v2/index.html');
  assert.equal(run({ ...file, hash: '#tasks/start/light' }), 'archive/v1/index.html#tasks/start/light');
  assert.equal(run({ ...file, hash: '#' }), 'v2/index.html');
});

test('_redirects never matches the root and forwards features with one splat rule', () => {
  const rules = fs.readFileSync(path.join(root, '_redirects'), 'utf8').split('\n').filter(line => line && !line.startsWith('#'));
  for (const rule of rules) assert.ok(!/^\/(index\.html)?\s/.test(rule), rule);
  assert.ok(rules.includes('/features/* /archive/v1/features/:splat 301'));
  assert.ok(!rules.some(rule => rule.startsWith('/features/:name')));
});
