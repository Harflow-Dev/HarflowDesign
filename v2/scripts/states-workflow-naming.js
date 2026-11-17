/* First-save naming in the workflow editor. Provisional; no owner approval.
   HarflowMac c4cfc5508caa09c7a655428eb2073e181186793d has a static title and no Blank naming control.
   This adds only a draft-name field; saved-workflow renaming and engine operations remain outside this drawing. */
(function () {
  'use strict';
  var H = window.HFV2, T = H.templates, docs = H.componentDocs;
  var family = H.findFamily('workflow-editor');
  family.groups.splice(family.groups.indexOf('Loading'), 0, 'Workflow name');
  H.RENDERERS.workflowNaming = { api: 'workflowNaming', wrapper: 'hdc-specimen' };
  var cases = [
    { id: 'name-entry-empty', title: 'Workflow name · empty', value: '', focused: false },
    { id: 'name-entry-focused', title: 'Workflow name · focused', value: '', focused: true },
    { id: 'name-entry-named', title: 'Workflow name · entered', value: 'Release checklist', focused: false },
    { id: 'name-entry-long', title: 'Workflow name · long name', value: 'Release checklist for desktop applications and their independently versioned engines', focused: true }
  ];
  function replaceOne(html, from, to) {
    if (html.indexOf(from) < 0 || html.indexOf(from) !== html.lastIndexOf(from)) throw new Error('Workflow naming base changed: ' + from);
    return html.replace(from, to);
  }
  cases.forEach(function (entry) {
    [false, true].forEach(function (minimum) {
      var id = entry.id + (minimum ? '-minimum' : ''), route = 'workflow-editor/' + id;
      var field = '<input class="hd-input hd-topbar__title hd-workflow-name" aria-label="Workflow name" placeholder="New workflow" type="text" value="' + entry.value + '" autocomplete="off" spellcheck="false" data-name-focused="' + entry.focused + '">';
      var html = replaceOne(T['workflow-editor/name-required'], '<span class="hd-topbar__title hd-faint">New workflow</span>', field);
      html = html.replace('class="hd-app"', 'class="hd-app hd-workflow-naming"').replace('width: 100%; height: 800px;', 'width: ' + (minimum ? 1000 : 1280) + 'px; height: ' + (minimum ? 620 : 800) + 'px;');
      T[route] = html;
      H.registerState('workflow-editor', {
        id: id, title: entry.title + (minimum ? ' · 1000 × 620' : ''),
        description: 'A new unsaved workflow with its name editable in the title position; saved workflow titles remain static.',
        group: 'Workflow name', status: 'provisional', approvalNote: 'Provisional · not approved',
        specimenSize: minimum ? '1000 × 620' : '1280 × 800', source: { renderer: 'workflowNaming', mount: id }
      });
      docs[route] = '<p>The name field is for a new unsaved workflow only. Type directly; leaving the field retains the draft text. Enter and Escape have no separate commit, revert or submission behavior. Empty or whitespace-only text keeps Save off. A nonblank edited name shows Checking workflow… and keeps Save off: this demonstration makes no validator call and never invents a successful check. The initial named and long-name states likewise await validation. Focused states place keyboard focus in the field; long names use native input horizontal scrolling. Reload or reopen the route to reset. Browser text fields, focus and canvas fixtures approximate native controls. <a href="docs/decisions/workflow-first-save-name.md">Design record and source limits</a>.</p>';
    });
  });
  H.workflowNaming = { mount: function (root, id) {
    var minimum = id.endsWith('-minimum');
    if (minimum) {
      root.classList.add('hdc-specimen--minimum');
      H.applyMinimum(root, ['sidebar', 'inspector', 'canvas', 'topbar-meta']);
    }
    var field = root.querySelector('.hd-workflow-name');
    var row = root.querySelector('.hd-main [role="status"]');
    var save = Array.prototype.find.call(root.querySelectorAll('.hd-topbar button'), function (button) { return button.textContent.trim() === 'Save'; });
    function input() {
      var named = field.value.trim().length > 0;
      row.textContent = '';
      if (named) {
        var glyph = document.createElement('span');
        glyph.className = 'hd-glyph hd-glyph--running';
        glyph.setAttribute('aria-hidden', 'true');
        glyph.style.width = '14px'; glyph.style.height = '14px';
        row.appendChild(glyph);
      }
      var text = document.createElement('span');
      text.textContent = (named ? 'Checking workflow…' : 'Enter a workflow name.') + ' · 6 nodes · 1 on demand';
      row.appendChild(text);
      save.disabled = true;
    }
    input();
    field.addEventListener('input', input);
    if (field.getAttribute('data-name-focused') === 'true') { field.focus(); field.setSelectionRange(field.value.length, field.value.length); }
    return function () {
      field.removeEventListener('input', input);
      if (minimum) { H.clearMinimum(root); root.classList.remove('hdc-specimen--minimum'); }
    };
  } };
})();
