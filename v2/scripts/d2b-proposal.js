/* Deterministic browser-only fixtures. No engine access or production data. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {
  };
  var text = 'Find and fix the slot release race. Keep notification under the lock. Add a deterministic regression. Preserve unrelated edits. Report the exact focused validation result and any remaining uncertainty before concluding.';
  var variants = {
    request: ['sidecar','inline','preview','unverified','truncated','loading','unavailable',
    'integrity-failed'], size: ['reference','minimum'], // size is kept only so the builder digest in the tests still covers its 272 cases
    summaryCoverage: ['observed','empty',
    'loading','unavailable','limited'], history: ['observed','empty','loading','partial',
    'unknown', 'unavailable','unsupported','nonprogress','reconnecting','reset','capacity',
    'drained']
  };
  function createState(name) {
    name = (name || 'observed').replace('d2b-proposal/','');
    var state = {
      name:name, size:'reference', status:['loading','reconnecting','capacity'].indexOf(name) >= 0 ? 'Running' : 'Done',
      request:name === 'integrity-failed' ? name : name === 'loading' ? 'loading' : name === 'partial' ? 'truncated' : name === 'unavailable' ? name : 'sidecar',
      history:name === 'events' ? 'unknown' : name === 'integrity-failed' ? 'partial' : name,
      summaryCoverage:name==='observed'||name==='capacity'?'observed':name==='loading'?'loading':'unavailable',
      captureUncertainty:['observed','capacity','loading','empty','drained'].indexOf(name)<0, windowEpoch:0, pendingSourceEpoch:name==='reset'?'mock-source-b':null, maxBytes:64, sourceEpoch:'mock-source-a', anchor:'row-a', rows:[ {
        id:'row-a',sourceEpoch:'mock-source-a',windowEpoch:0,occurrence:0,seq:7,type:'message'
      }, {
        id:'row-b',sourceEpoch:'mock-source-a',windowEpoch:0,occurrence:1,seq:name==='events'?7:8,type:name==='events'?'unsupported':'tool_result'
      }, {
        id:'row-c',sourceEpoch:'mock-source-a',windowEpoch:0,occurrence:2,seq:name==='events'?6:9,type:'message'
      }], older:false, fresh:false, currentWindow:false, message:''
    };
    if (['loading', 'empty', 'unsupported', 'unavailable'].indexOf(name) >= 0) state.rows = [];
    return state;
  }
  function rowKey(row) {
    return row.sourceEpoch + ':' + row.windowEpoch + ':' + row.occurrence;
  }
  function hasToolEvidence(s) {
    return s.rows.some(function (row) { return row.type === 'tool_call' || row.type === 'tool_result'; });
  }
  function transition(s, action, value) {
    var n = Object.assign( {
    },s);
    if(action === 'request') {
      n.request=value;
      n.maxBytes=64;
    } if(action === 'history') {
      n.history=value;
      n.older=false;
      n.fresh=false;
      n.currentWindow=false;
      var fixture=createState(value==='unknown'?'events':value);
      n.rows=fixture.rows;
      n.windowEpoch=fixture.windowEpoch;
      n.pendingSourceEpoch=fixture.pendingSourceEpoch;
      n.captureUncertainty=fixture.captureUncertainty;
      n.sourceEpoch='mock-source-a';
      n.anchor='row-a';
      n.message='';
    } if(action === 'size') n.size=value;
    if(action === 'summaryCoverage') {
      n.summaryCoverage=value;
      if(['observed','empty'].indexOf(value)>=0 && (n.captureUncertainty || (!n.currentWindow && ['partial','unknown',
      'unsupported','reset','reconnecting','unavailable','nonprogress'].indexOf(n.history)>=0))) {
        n.summaryCoverage='unavailable';
        n.message='Catalog: known capture uncertainty prevents observed totals for this variant.';
      }
      if(value==='empty' && hasToolEvidence(n)) {
        n.summaryCoverage='unavailable';
        n.message='Catalog: choose a tool-free captured fixture before showing a qualified zero.';
      }
      if(n.history==='loading') {
        n.summaryCoverage='loading';
        n.message='Catalog: captured activity totals remain loading while history loads.';
      }
    } if(action === 'history' && ['partial','unknown','reset','unsupported','unavailable',
    'reconnecting','nonprogress'].indexOf(value)>=0)n.summaryCoverage='unavailable';
    if(action === 'read-more') n.maxBytes=Math.min(128,n.maxBytes*2);
    if(action === 'earlier' && !s.older) {
      n.older=true;
      n.rows=[ {
        id:'row-earlier',sourceEpoch:n.sourceEpoch,windowEpoch:n.windowEpoch,occurrence:-1,seq:5,type:'message'
      }].concat(n.rows);
      if(n.history==='observed')n.history='drained';
      n.message='Earlier captured rows loaded. Reading position retained.';
    } if(action === 'new' && !s.fresh) {
      n.fresh=true;
      n.rows=n.rows.concat([ {
        id:'row-new',sourceEpoch:n.sourceEpoch,windowEpoch:n.windowEpoch,occurrence:3,seq:10,type:'message'
      }]);
      n.message='New captured activity shown by request.';
    } if(action === 'retry') {
      n.history='partial';
      n.captureUncertainty=true;
      n.summaryCoverage='unavailable';
      n.message='Mock read reconnected. Cached rows retained; a history gap remains. Task execution was not restarted.';
    } if(action === 'retry-request') {
      n.request='unavailable';
      n.message='Mock observation retry returned unavailable. No assignment text was admitted.';
    } if(action === 'rebase') {
      n.history='partial';
      n.older=false;
      n.fresh=true;
      n.currentWindow=true;
      n.windowEpoch=s.windowEpoch+1;
      if(n.pendingSourceEpoch) {
        n.sourceEpoch=n.pendingSourceEpoch;
        n.pendingSourceEpoch=null;
        n.captureUncertainty=true;
        n.summaryCoverage='unavailable';
      }
      n.anchor='row-current';
      n.rows=[ {
        id:'row-current',sourceEpoch:n.sourceEpoch,windowEpoch:n.windowEpoch,occurrence:0,seq:11,type:'message'
      }];
      n.message='Current activity window loaded by request. Earlier coverage is unknown.';
    } return n;
  }
  function requestView(s) {
    var r=s.request, full=r==='sidecar'||r==='inline';
    return {
      title:full?'Original request':r==='preview'?'Request preview':r==='integrity-failed'?'Original request · integrity check failed':r==='loading'?'Original request · loading':r==='unavailable'?'Original request unavailable':'Partial request',
      text:['loading','unavailable','integrity-failed'].indexOf(r)>=0?'':full?text:text.slice(0,
      s.maxBytes), copy:full?'Copy original request':r==='preview'?'Copy preview':'Copy displayed text',
      full:full, integrity:r==='sidecar'?'Verified stored request · complete':r==='inline'?'Complete stored request':r==='unverified'?'Unverified text · completeness unknown':r==='truncated'?'Bounded prefix · truncated':r==='preview'?'Preview only · not the full assignment':''
    };
  }
  function activityView(s) {
    var messages= {
      observed:'Captured activity caught up',empty:'No rows in the available captured history',
      loading:'Loading captured history',partial:'History incomplete · capture gap',unknown:'History incomplete · unsupported record retained in Events',
      unavailable:'Captured history unavailable · the read could not be completed',unsupported:'History unavailable · this engine does not support bounded history',
      nonprogress:'History paused · read made no progress',reconnecting:'Reconnecting · cached history is not current',
      reset:'Activity source changed · cached history is not current',capacity:'This view reached its limit. Your reading position is kept.',
      drained:'Available captured history reached its beginning'
    };
    var coverage=s.summaryCoverage;
    if((s.captureUncertainty || (!s.currentWindow && ['partial','unknown','unsupported','reset','reconnecting','unavailable',
    'nonprogress'].indexOf(s.history)>=0)) && ['observed','empty'].indexOf(coverage)>=0)coverage='unavailable';
    if(coverage==='empty' && hasToolEvidence(s))coverage='unavailable';
    if(s.history==='loading')coverage='loading';
    var sound=['observed','empty'].indexOf(coverage)>=0;
    return {
      toolCount:sound?(coverage==='empty'?0:2):null, taskStatus:s.status, title:s.currentWindow?(s.captureUncertainty?'Current activity window · captured history remains incomplete':'Current activity window · earlier rows outside this view'):messages[s.history]||messages.partial,
      count:coverage==='loading'?'Loading tool activity':sound?(coverage==='empty'?'No tool calls observed in the available captured history':'2 tool calls observed'):'Tool activity unavailable',
      summaryCoverage:coverage, reason:coverage==='limited'?'The activity summary reached its limit; tool activity totals are unavailable.':sound?'Observed in available captured history traversed from its beginning to the current boundary; this does not prove complete execution capture.':'Capture coverage is insufficient for a tool count.'
    };
  }
  function esc(v) {
    var replacements = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    };
    replacements[String.fromCharCode(39)] = '&#39;';
    return String(v).split('').map(function (character) {
      return replacements[character] || character;
    }).join('');
  }
  function button(action,label) {
    return '<button type="button" class="hd-btn hd-btn--secondary hd-btn--sm" data-action="'+action+'">'+label+'</button>';
  }
  function options(list,value) {
    return list.map(function(v) {
      return '<option'+(v===value?' selected':'')+'>'+v+'</option>';
    }).join('');
  }
  /* ---------- Pure builders: markup of the transcript regions from a state ---------- */
  function statusHtml(s) {
    return '<span class="hd-badge">'+(s.status==='Done'?'<span class="hd-glyph hd-glyph--done" aria-hidden="true"><span class="hd-i hd-i--sm hd-i-check"></span></span>':'<span class="hd-glyph hd-glyph--running" aria-hidden="true"></span>') +
      s.status+'</span>';
  }
  // The review controls: the Request, History and Totals selects.
  function controlsHtml(s) {
    return '<label>Request <select data-variant="request">'+options(variants.request,
      s.request)+'</select></label><label>History <select data-variant="history">'+options(variants.history,
      s.history)+'</select></label><label>Totals <select data-variant="summaryCoverage">'+options(variants.summaryCoverage,
      s.summaryCoverage)+'</select></label>';
  }
  function requestHtml(s) {
    var r=requestView(s);
    return '<details data-disclosure="request" class="hd-d2b-request" open><summary>'+r.title +
      '</summary>'+ (r.text?'<p class="hd-muted">'+r.integrity+'</p><pre tabindex="0" data-copy-text>'+esc(r.text)+'</pre>' +
      '<span class="hd-row hd-d2b-actions">'+button('copy-request',r.copy)+(['truncated','unverified'].indexOf(s.request)>=0&&s.maxBytes<128?button('read-more',
      'Read more'):'')+(['truncated','unverified'].indexOf(s.request)>=0&&s.maxBytes===128?'</span><p class="hd-muted">View limit reached. Full request remains unavailable in this view.</p>':'</span>'):(s.request==='loading'?'<div class="hd-d2b-skeleton" aria-label="Loading request"></div>':'<p class="' +
      (s.request==='integrity-failed'?'hd-d2b-error':'hd-muted')+'">'+(s.request==='integrity-failed'?'Content withheld because integrity verification failed.':'The original request could not be read.') +
      '</p>'+button('retry-request','Retry request read')))+'</details>';
  }
  function boundaryHtml(s) {
    var a=activityView(s);
    var actions='';
    if(['observed','partial','unknown'].indexOf(s.history)>=0&&!s.older)actions+=button('earlier',
    'Load earlier');
    if(s.history==='reconnecting'||s.history==='nonprogress')actions+=button('retry','Retry history read');
    if(s.history==='capacity'||s.history==='reset') actions+='<p>Loading current activity replaces the rows in this view. Execution continues independently.</p>' +
    button('rebase','Load current activity');
    if(s.history==='observed'&&!s.fresh)actions+=button('new','New activity · show');
    return '<div class="hd-d2b-boundary"><strong>'+a.title+'</strong>'+'<div class="hd-row hd-d2b-actions">'+actions+'</div></div>';
  }
  function rowsHtml(s) {
    var earlierRow=s.older?'<article class="hd-d2b-row hd-msg-agent" data-row="earlier"><strong>Earlier captured activity</strong><p>Read slot release implementation.</p></article>':'';
    return s.currentWindow?earlierRow+'<article class="hd-d2b-row hd-msg-agent" data-row="new">' +
      '<strong>Current activity window</strong>' +
      '<p>This view now shows current captured activity. Earlier rows are outside this view.</p>' +
      '</article>':s.history==='loading'?'<div class="hd-d2b-skeleton" aria-label="Loading history">' +
      '</div>':s.history==='empty'||s.history==='unsupported'||s.history==='unavailable'?'':(s.older?'<article class="hd-d2b-row hd-msg-agent" data-row="earlier">' +
      '<strong>Earlier captured activity</strong>' +
      '<p>Read slot release implementation.</p>' +
      '</article>':'') +
    '<article class="hd-d2b-row hd-msg-agent" data-row="anchor">' +
      '<strong>Codex</strong>' +
      '<p>I found the notification outside the lock. I will reproduce the race before changing it.</p>' +
      '</article>' +
      '<article class="hd-d2b-row hd-msg-agent" data-row="tool">' +
      '<details data-disclosure="tool-regression">' +
      '<summary class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-terminal" aria-hidden="true"></span><span class="hd-tool__summary">Ran deterministic slot regression</span><span class="hd-i hd-i--sm hd-i-chevron-right hd-d2b-tool-chevron" aria-hidden="true"></span></summary>' +
      '<pre class="hd-tool__body">Mock focused regression\nArrange: hold the release lock\nStart a waiting consumer\nRelease and notify under the lock\nAssert: consumer observes the free slot\nResult: deterministic race reproduced\nPatch: notification moved under lock\nResult after patch: focused regression passed</pre>' +
      '</details>' +
      '</article>' +
      '<article class="hd-d2b-row hd-msg-agent" data-row="validation-summary">' +
      '<strong>Codex</strong>' +
      '<p>The notification now runs under the lock. The focused regression passed in this mock transcript.</p>' +
      '</article>' +
    (s.fresh?'<article class="hd-d2b-row hd-msg-agent" data-row="new"><strong>New captured activity</strong><p>Focused validation result received.</p></article>':'');
  }
  // The sections of the Events side pane: facts, task snapshot, captured records and recovered transcript.
  function asideSectionsHtml(s) {
    var a=activityView(s);
    var envelope= {
      format:'harflow.event',v:1,product:'harflow',product_version:'0.0.8',seq:7,observed_at:'2026-11-04T10:00:00Z'
    };
    var record=Object.assign( {
    },envelope, {
      kind:'tool_result',call_id:'mock-call-1',ok:true,output_tail:'Mock regression reproduced'
    });
    var stub=Object.assign( {
    },envelope, {
      kind:'future_kind',truncated:true,oversized:true,bytes:20000
    });
    var extra=['partial','unknown'].indexOf(s.history)>=0?'<details data-disclosure="event-stub"><summary>Unsupported record · public stub</summary><pre>' +
    esc(JSON.stringify(stub,null,2))+'</pre><p>No tool summary is inferred from this record.</p></details><details data-disclosure="event-order"><summary>Record ordering</summary><pre>' +
    esc(JSON.stringify([ {
      kind:'assistant_text',seq:7
    }, {
      kind:'future_kind',seq:7
    }, {
      kind:'assistant_text',seq:6
    }],null,2))+'</pre><p>Duplicate and regressing sequence values remain in observed order.</p></details>':'';
    var records=['loading','empty','unsupported','unavailable'].indexOf(s.history)>=0?'<p class="hd-muted">No records available in this view.</p>':'<details data-disclosure="event-result"><summary>Tool result · normalized record</summary><pre data-record>' +
    esc(JSON.stringify(record,null,2))+'</pre>'+button('copy-record','Copy normalized record')+'</details>'+extra;
    return '<h3>Captured activity facts</h3><p>'+a.count+'</p><p class="hd-muted">'+a.reason +
    '</p><hr><h3>Task snapshot</h3><p>Status: '+s.status+' · independent of captured activity</p><hr><h3>Captured activity</h3><p class="hd-muted">Public normalized events · bounded record window</p>' +
    records+'<hr><h3>Recovered transcript</h3><p class="hd-muted">Separate recovery source. Not used for captured activity totals.</p><details data-disclosure="recovery-message"><summary>Recovered message</summary><p>Mock recovery text: validation was requested.</p></details>';
  }

  /* ---------- Controller: owns the view state of one transcript and survives re-renders of its slots ---------- */
  // attach(root, state, slots, opts): `root` receives the click and change listeners once. `slots` returns the
  // current slot elements ({controls, status, request, boundary, rows, history, live, facts, factsScroll}); every
  // slot may be null.
  // The state object belongs to the controller. After the surrounding screen replaced the slot elements,
  // refresh(snapshot) fills them again and restores the view from the snapshot taken before.
  function attach(root, state, slots, opts) {
    opts = opts || {};
    var host = root, s = state, disposed = false;
    function sl() { return (typeof slots === 'function' ? slots() : slots) || {}; }
    function q(sel) {
      return host.querySelector(sel);
    }
    var lastMessage = '';
    // Disclosure states and the Events scroll kept across slots that are absent for a while (the Events pane
    // while it is closed). Only the surrounding screen's re-render path reads it.
    var kept = { disclosures: {}, factsScroll: 0 };
    function announce(message) {
      var live = sl().live;
      if (live) live.textContent = message;
    }
    function captureVisibleAnchor() {
      var history = sl().history;
      if (!history) return null;
      var bounds = history.getBoundingClientRect();
      var visible = Array.from(history.querySelectorAll('[data-row]')).find(function (row) {
        var rect = row.getBoundingClientRect();
        return rect.bottom > bounds.top && rect.top < bounds.bottom;
      });
      return visible ? {
        id: visible.dataset.row,
        offset: visible.getBoundingClientRect().top - bounds.top
      } : null;
    }
    function restoreVisibleAnchor(anchor) {
      var history = sl().history;
      if (!history) return;
      var row = anchor && Array.from(history.querySelectorAll('[data-row]')).find(function (candidate) {
        return candidate.dataset.row === anchor.id;
      });
      if (!row) {
        history.scrollTop = 0;
        announce((s.message || '') + ' The retained row is outside this view; showing the history boundary.');
        return;
      }
      var target = history.scrollTop + row.getBoundingClientRect().top - history.getBoundingClientRect().top - anchor.offset;
      history.scrollTop = target;
      if (Math.abs(history.scrollTop - target) > 1) {
        announce((s.message || '') + ' The view edge limited the retained offset.');
      }
    }
    // Preserve disclosure identity independently of sequence numbers or row positions.
    function captureView() {
      var disclosures = {
      };
      host.querySelectorAll('[data-disclosure]').forEach(function (detail) {
        disclosures[detail.dataset.disclosure] = detail.open;
      });
      var requestText = q('[data-copy-text]');
      var slot = sl();
      var factsScroller = slot.factsScroll || slot.facts;
      return {
        disclosures: disclosures, requestScroll: requestText ? requestText.scrollTop : 0, factsScroll: factsScroller ? factsScroller.scrollTop : 0
      };
    }
    function restoreView(view, resetHistory) {
      host.querySelectorAll('[data-disclosure]').forEach(function (detail) {
        var key = detail.dataset.disclosure;
        var replaced = key.indexOf('tool-') === 0 || key.indexOf('event-') === 0;
        if ((!resetHistory || !replaced) && Object.prototype.hasOwnProperty.call(view.disclosures,
        key)) {
          detail.open = view.disclosures[key];
        }
      });
      var requestText = q('[data-copy-text]');
      if (requestText) requestText.scrollTop = view.requestScroll;
      var slot = sl();
      var factsScroller = slot.factsScroll || slot.facts;
      if (factsScroller) factsScroller.scrollTop = view.factsScroll;
    }
    function fill() {
      var slot = sl();
      if (slot.controls) slot.controls.innerHTML = controlsHtml(s);
      if (slot.status) slot.status.innerHTML = statusHtml(s);
      if (slot.request) slot.request.innerHTML = requestHtml(s);
      if (slot.boundary) slot.boundary.innerHTML = boundaryHtml(s);
      if (slot.rows) slot.rows.innerHTML = rowsHtml(s);
      if (slot.facts) slot.facts.innerHTML = asideSectionsHtml(s);
    }
    // Where the history is reset (rebase or a History variant change), the kept states of its replaced
    // disclosures are dropped, as the live ones are.
    function invalidateKept() {
      Object.keys(kept.disclosures).forEach(function (key) {
        if (key.indexOf('tool-') === 0 || key.indexOf('event-') === 0) delete kept.disclosures[key];
      });
    }
    function render(resetHistory) {
      var savedView = captureView();
      if (resetHistory) invalidateKept();
      fill();
      restoreView(savedView, resetHistory);
      announce(s.message||'');
      lastMessage = s.message || '';
    }
    // Before the surrounding screen replaces the slot elements.
    function snapshot() {
      var history = sl().history;
      var view = captureView();
      Object.assign(kept.disclosures, view.disclosures);
      var slot = sl();
      if (slot.factsScroll || slot.facts) kept.factsScroll = view.factsScroll;
      return { view: view, anchor: captureVisibleAnchor(), historyScroll: history ? history.scrollTop : 0 };
    }
    // After the surrounding screen replaced them. A history at its top stays at its top; otherwise the
    // reading anchor keeps its offset, and the live region says when the view edge limited that.
    function refresh(saved) {
      fill();
      if (saved) restoreView({ disclosures: kept.disclosures, requestScroll: saved.view.requestScroll, factsScroll: kept.factsScroll }, false);
      // The surrounding screen renders the current message into the live region it inserts, so it stays
      // visible without being announced again. Only a message that was not announced yet is announced here.
      if ((s.message || '') !== lastMessage) { announce(s.message || ''); lastMessage = s.message || ''; }
      var history = sl().history;
      if (!saved || !history) return;
      if (saved.anchor && saved.historyScroll > 0) restoreVisibleAnchor(saved.anchor);
      else history.scrollTop = saved.historyScroll;
    }
    function onChange(e) {
      var kind = e.target.dataset.variant;
      if (!kind) return;
      var anchor = captureVisibleAnchor();
      s = transition(s, kind, e.target.value);
      render(kind === 'history');
      if (kind === 'size') restoreVisibleAnchor(anchor);
      var select = q('[data-variant="' + kind + '"]');
      if (select) select.focus({ preventScroll: true });
    }
    async function onClick(e) {
      var b=e.target.closest('[data-action]');
      if(!b||!host.contains(b))return;
      var action=b.dataset.action;
      if(action==='copy-request'||action==='copy-record') {
        var el=q(action==='copy-request'?'[data-copy-text]':'[data-record]');
        if(!el)return;
        try {
          if(!window.navigator||!window.navigator.clipboard)throw new Error('unavailable');
          await window.navigator.clipboard.writeText(el.textContent);
          if(!disposed)announce('Copied '+(action==='copy-record'?'normalized mock record.':'displayed mock request text.'));
        } catch(_) {
          if(disposed)return;
          var selection=window.getSelection(),range=host.ownerDocument.createRange();
          range.selectNodeContents(el);
          selection.removeAllRanges();
          selection.addRange(range);
          el.focus();
          announce('Text selected. Use your system copy command to copy it.');
        }return;
      }
      var scroll=sl().history;
      var visibleAnchor = captureVisibleAnchor();
      var oldScroll = scroll.scrollTop;
      s=transition(s,action);
      render(action==='rebase');
      if(action==='earlier') {
        restoreVisibleAnchor(visibleAnchor);
        var restored=q('[data-action="earlier"]');
        if(restored)restored.focus({
          preventScroll:true
        });
        else q('[data-d2b-boundary]').focus({
          preventScroll:true
        });
      } else if(action==='new') {
        scroll.scrollTop=scroll.scrollHeight;
        q('[data-row="new"]').setAttribute('tabindex','-1');
        q('[data-row="new"]').focus({
          preventScroll:true
        });
      } else if(action==='rebase') {
        scroll.scrollTop=0;
        q('[data-d2b-boundary]').focus({
          preventScroll:true
        });
      } else {
        scroll.scrollTop=oldScroll;
        var same=q('[data-action="'+action+'"]');
        if(same)same.focus({
          preventScroll:true
        });
        else if(action==='read-more'||action==='retry-request') {
          var requestTarget=q('[data-copy-text]')||q('[data-d2b-request] summary');
          requestTarget.focus({preventScroll:true});
        } else q('[data-d2b-boundary]').focus({preventScroll:true});
      }
    }
    host.addEventListener('change',onChange);
    host.addEventListener('click',onClick);
    return {
      render: render, snapshot: snapshot, refresh: refresh,
      state: function () { return s; },
      dispose: function () {
        disposed=true;
        host.removeEventListener('change',onChange);
        host.removeEventListener('click',onClick);
      }
    };
  }
  H.d2bProposal= {
    createState:createState,transition:transition,requestView:requestView,activityView:activityView,
    variants:variants,rowKey:rowKey
  };
  H.d2bTranscript= {
    attach:attach,statusHtml:statusHtml,controlsHtml:controlsHtml,requestHtml:requestHtml,boundaryHtml:boundaryHtml,
    rowsHtml:rowsHtml,asideSectionsHtml:asideSectionsHtml
  };
})();
