/* Isolated workflow-question drawings. Provisional; no engine connection or authority. */
(function () {
  'use strict';
  var H = window.HFV2, T = H.templates;
  var family = H.findFamily('needs-you');
  family.groups.splice(family.groups.indexOf('Loading'), 0, 'Workflow questions');
  H.RENDERERS.workflowQuestions = { api: 'workflowQuestions', wrapper: 'hdc-specimen' };
  var states = [
    ['workflow-question', 'Workflow question', 'A workflow question with a free-text answer.'],
    ['workflow-question-offered', 'Workflow question · offered answers', 'A usage-limit question with only the offered answers.'],
    ['workflow-question-answered', 'Workflow question · answered elsewhere', 'The winning answer and the unsent local draft.'],
    ['workflow-question-unavailable', 'Workflow question · source unavailable', 'The last known question with its controls disabled.']
  ];
  var docs = H.componentDocs = H.componentDocs || {};
  function card(id) {
    var offered = id === 'workflow-question-offered';
    var settled = id === 'workflow-question-answered';
    var unavailable = id === 'workflow-question-unavailable';
    var text = offered ? 'The harness reached its usage limit. How should this run continue?' : 'Which environment should the dependency audit use?';
    var body = '<section class="hd-approval hf-question" aria-label="Workflow question"><div class="hd-approval__head"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span>Asks a question</span><span class="hd-approval__src">Workflow: Nightly dependency audit · step Check dependencies</span></div><div class="hd-approval__body"><p class="hf-question__text">' + text + '</p>';
    if (settled) {
      body += '<div class="hf-question__receipt" tabindex="-1"><h2>Already answered by the caller</h2><p>16 Nov 2026, 09:30</p><p>Use staging</p><h3>Your saved draft</h3><p>Check production first</p></div>';
    } else {
      body += '<p class="hd-approval__meta">The caller and Harflow can both answer this question.</p>';
      if (unavailable) body += '<div class="hf-question__notice" role="status">Harflow could not read this request right now. <button type="button" class="hd-btn hd-btn--secondary" data-question-retry>Try again</button><span data-question-read-result></span></div>';
      body += '<form data-question-form><fieldset' + (unavailable ? ' disabled' : '') + '><legend class="hd-sr">Your answer</legend>';
      if (offered) body += '<p class="hd-approval__meta">Choose one of the offered answers.</p><div class="hf-question__actions"><button type="submit" class="hd-btn hd-btn--secondary" name="answer" value="retry">retry</button><button type="submit" class="hd-btn hd-btn--secondary" name="answer" value="switch">switch</button></div>';
      else body += '<label for="workflow-question-answer">Your answer</label><textarea id="workflow-question-answer" class="hd-input hf-question__answer" rows="4" placeholder="Type an answer">' + (unavailable ? 'Check production first' : '') + '</textarea><button type="submit" class="hd-btn hd-btn--primary" data-question-send disabled>Send answer</button>';
      body += '</fieldset></form>';
    }
    return body + '</div><div class="hd-approval__actions"><a class="hd-btn hd-btn--ghost" href="#workflow-run/graph-needs-you">Open run</a></div></section>';
  }
  states.forEach(function (entry) {
    [false, true].forEach(function (small) {
      var id = entry[0] + (small ? '-minimum' : ''), route = 'needs-you/' + id;
      var html = T['needs-you/waiting'];
      var begin = html.indexOf('<section class="hd-approval" aria-label="Asks a question">');
      var end = html.indexOf('</section>', begin);
      if (begin < 0 || end < 0 || html.indexOf('<section class="hd-approval" aria-label="Asks a question">', begin + 1) >= 0) throw new Error('Workflow question base card missing or ambiguous');
      html = html.slice(0, begin) + card(entry[0]) + html.slice(end + '</section>'.length);
      html = html.replace('class="hd-app"', 'class="hd-app hf-question-app' + (small ? ' hf-question-app--minimum' : '') + '"').replace('width: 100%; height: 800px;', 'width: ' + (small ? '1000' : '1280') + 'px; height: ' + (small ? '620' : '800') + 'px;');
      T[route] = html;
      H.registerState('needs-you', { id: id, title: entry[1] + (small ? ' · 1000 × 620' : ''), description: entry[2], group: 'Workflow questions', status: 'provisional', specimenSize: small ? '1000 × 620' : '1280 × 800', source: { renderer: 'workflowQuestions', mount: id } });
      docs[route] = '<p>Workflow question in Needs you. <a href="docs/decisions/workflow-questions.md">Design record and source limits</a>. The other two cards retain the waiting screen context. Loading and empty use the existing Needs you states. Reload or leave and reopen this route to reset. Send and offered-answer buttons preserve the input and focus in this demonstration; Try again repeats the unavailable read without enabling an answer. No engine operation occurs.</p>';
    });
  });
  H.workflowQuestions = { mount: function (root, mountId) {
    var minimum = mountId.endsWith('-minimum');
    if (minimum) {
      root.classList.add('hdc-specimen--minimum');
      H.applyMinimum(root, ['sidebar']);
    }
    var form = root.querySelector('[data-question-form]');
    var field = root.querySelector('textarea');
    var send = root.querySelector('[data-question-send]');
    var retry = root.querySelector('[data-question-retry]');
    function input() { if (send) send.disabled = !field.value.trim(); }
    function submit(event) {
      event.preventDefault();
      if (root.querySelector('fieldset').disabled || (field && !field.value.trim())) return;
      // Demonstration only: retain the input and focus without inventing an engine outcome.
    }
    function reread() { root.querySelector('[data-question-read-result]').textContent = ' Still unavailable. Your draft is kept.'; }
    if (field) field.addEventListener('input', input);
    if (form) form.addEventListener('submit', submit);
    if (retry) retry.addEventListener('click', reread);
    return function () {
      if (minimum) {
        H.clearMinimum(root);
        root.classList.remove('hdc-specimen--minimum', 'hdc-min-sidebar');
      }
      if (field) field.removeEventListener('input', input);
      if (form) form.removeEventListener('submit', submit);
      if (retry) retry.removeEventListener('click', reread);
    };
  } };
})();
