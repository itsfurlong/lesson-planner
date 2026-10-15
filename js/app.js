/* Lesson Planner interview. One question per screen, answers kept in this browser only. */
(function () {
  'use strict';
  var B = window.LP_BANKS;
  var TOTAL = 19;

  /* ---------- storage (every access wrapped; the page works without it) ---------- */
  var store = {
    read: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    write: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    remove: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  /* ---------- state ---------- */
  function blank() {
    var p = store.read('lp.profile') || {};
    return {
      basics: { teacher: p.teacher || '', grade: p.grade || '', subject: p.subject || 'English', period: p.period || '' },
      focus: { text: '', skills: [], other: '' },
      standards: [],
      prior: { pick: '', text: '' },
      assets: { picks: [], detail: '' },
      content: { ideas: '', terms: [{ term: '', definition: '' }], links: [] },
      objectives: [{ level: '', verb: '', knowledge: '', what: '', purpose: '' }],
      eq: { pick: '', text: '' },
      materials: { picks: [], text: '', other: '' },
      grouping: { picks: [], seating: '', movement: '' },
      initiation: { motivating: { pick: '', text: '' }, bg: { pick: '', text: '' }, minutes: '' },
      instruction: { lang: { pick: '', text: '' }, direct: { pick: '', text: '' }, probing: '', minutes: '' },
      guided: { task: { pick: '', text: '' }, grouping: '', minutes: '' },
      independent: { task: { pick: '', text: '' }, same: false, minutes: '' },
      closure: { act: { pick: '', text: '' }, language: '', homework: '', minutes: '' },
      assessment: { informal: [], formal: [], graded: '', rubric: '' },
      struggling: [{ initials: '', evidence: '', strategy: '' }], noStruggling: false,
      enrichment: [{ initials: '', evidence: '', strategy: '' }], noEnrichment: false,
      research: { initialized: false, checked: {}, sentences: {}, auto: {} },
      plan: { edits: {}, auto: {} }
    };
  }
  var answers = blank();
  var i = -1;          // -1 is the welcome screen
  var maxSeen = 0;

  function merge(base, saved) {
    if (saved == null || typeof saved !== 'object' || Array.isArray(base) || Array.isArray(saved)) return saved === undefined ? base : saved;
    if (Object.keys(base).length === 0) return saved;   // free-form dictionaries (research picks, plan edits)
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = (k in saved) ? merge(base[k], saved[k]) : base[k]; });
    return out;
  }
  var draft = store.read('lp.draft');
  var hasDraft = !!(draft && draft.answers && draft.i >= 0);
  if (hasDraft) { answers = merge(blank(), draft.answers); i = -1; maxSeen = draft.maxSeen || draft.i || 0; }

  function persist() {
    store.write('lp.draft', { answers: answers, i: i, maxSeen: maxSeen });
    var b = answers.basics;
    store.write('lp.profile', { teacher: b.teacher, grade: b.grade, subject: b.subject, period: b.period });
  }
  function get(path) { return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, answers); }
  function set(path, v) {
    var ks = path.split('.'), o = answers;
    ks.slice(0, -1).forEach(function (k) { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; });
    o[ks[ks.length - 1]] = v;
    persist();
  }
  function profileComplete() { var b = answers.basics; return !!(b.teacher && b.grade && b.period); }

  /* ---------- tiny DOM helper ---------- */
  function h(tag, props) {
    var e = document.createElement(tag);
    var kids = Array.prototype.slice.call(arguments, 2);
    if (props) Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (k === 'class') e.className = v;
      else if (k === 'value') e.value = v;
      else if (k.indexOf('on') === 0 && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, '');
      else if (v !== false && v != null) e.setAttribute(k, v);
    });
    (function add(list) {
      list.forEach(function (c) {
        if (c == null || c === false) return;
        if (Array.isArray(c)) return add(c);
        e.append(c.nodeType ? c : document.createTextNode(c));
      });
    })(kids);
    return e;
  }
  var uid = 0;
  function nid() { return 'f' + (++uid); }
  function field(label, control, hint, forId) {
    return h('div', { class: 'field' },
      label ? h(forId ? 'label' : 'div', forId ? { for: forId } : { class: 'lab' }, label) : null,
      control,
      hint ? h('p', { class: 'hint' }, hint) : null);
  }

  /* ---------- field builders ---------- */
  function textField(path, o) {
    var id = nid();
    var el = o.multiline
      ? h('textarea', { id: id, rows: o.rows || 4, placeholder: o.placeholder || '' })
      : h('input', { id: id, type: 'text', placeholder: o.placeholder || '', autocomplete: o.autocomplete || 'off' });
    el.value = get(path) || '';
    el.addEventListener('input', function () { set(path, el.value); if (o.onInput) o.onInput(el.value); });
    if (o.enter && !o.multiline) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); next(); } });
    return field(o.label, el, o.hint, id);
  }
  function numberField(path, o) {
    var id = nid();
    var el = h('input', { id: id, type: 'number', inputmode: 'numeric', min: o.min || 0, max: o.max || 300, step: 1, placeholder: o.placeholder || '' });
    el.value = get(path) === '' || get(path) == null ? '' : get(path);
    el.addEventListener('input', function () { set(path, el.value === '' ? '' : Number(el.value)); if (o.onInput) o.onInput(); });
    return field(o.label, el, o.hint, id);
  }
  function checkField(path, label, hint) {
    var id = nid();
    var el = h('input', { id: id, type: 'checkbox' });
    el.checked = !!get(path);
    el.addEventListener('change', function () { set(path, el.checked); });
    return h('div', { class: 'field' }, h('label', { for: id, class: 'cite', style: 'display:flex;gap:10px;align-items:center;cursor:pointer;padding:10px 14px' }, el, h('span', null, label)), hint ? h('p', { class: 'hint' }, hint) : null);
  }
  function chipGroup(o) {
    var wrap = h('div', { class: 'chips', role: 'group', 'aria-label': o.aria || '' });
    function isOn(x) { var v = o.get(); return o.multi ? (v || []).indexOf(x) >= 0 : v === x; }
    function paint() {
      wrap.textContent = '';
      o.options.forEach(function (x) {
        var b = h('button', { type: 'button', class: 'chip' + (o.small ? ' small' : ''), 'aria-pressed': String(isOn(x)) }, o.render ? o.render(x) : x);
        b.addEventListener('click', function () {
          var v = o.get();
          if (o.multi) {
            var a = (v || []).slice();
            if (a.indexOf(x) >= 0) a = a.filter(function (y) { return y !== x; });
            else { if (o.max && a.length >= o.max) return; a.push(x); }
            o.set(a, x);
          } else {
            o.set(v === x && !o.sticky ? '' : x, x);
          }
          paint();
          if (o.after) o.after();
        });
        wrap.append(b);
      });
    }
    paint();
    wrap.repaint = paint;
    return wrap;
  }
  function chipsField(path, o) {
    var g = chipGroup({ options: o.options, multi: o.multi, max: o.max, sticky: o.sticky, small: o.small, aria: o.label,
      get: function () { return get(path); }, set: function (v) { set(path, v); }, after: o.after });
    return field(o.label, g, o.hint);
  }
  // Pick a starter or type of activity, then say the specifics in text.
  function pickText(base, o) {
    var id = nid();
    var ta = h('textarea', { id: id, rows: o.rows || 3, placeholder: o.placeholder || '' });
    ta.value = get(base + '.text') || '';
    var last = get(base + '.pick') || '';
    var g = chipGroup({ options: o.options, small: true, aria: o.label,
      get: function () { return get(base + '.pick'); },
      set: function (v) {
        set(base + '.pick', v);
        if (o.prefill && v && (!ta.value.trim() || ta.value === last)) { ta.value = v; set(base + '.text', v); }
        last = v;
      } });
    ta.addEventListener('input', function () { set(base + '.text', ta.value); });
    return h('div', { class: 'field' },
      h('div', { class: 'lab' }, o.label),
      o.hint ? h('p', { class: 'hint' }, o.hint) : null,
      g,
      h('label', { for: id, class: 'sr' }, o.label + ' details'),
      ta);
  }

  /* ---------- helpers for derived text ---------- */
  function lowerFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function swbat(o) {
    if (!o.verb && !o.what) return '';
    return 'Students will be able to ' + (o.verb || '{verb}') + ' ' + (o.what || '{what}') + (o.purpose ? ' ' + o.purpose : '') + '.';
  }
  var PHASES = ['initiation', 'instruction', 'guided', 'independent', 'closure'];
  function totalMinutes() { return PHASES.reduce(function (s, p) { return s + (Number(get(p + '.minutes')) || 0); }, 0); }
  function gradeBand() {
    var g = Number(answers.basics.grade);
    return g >= 11 ? '11-12' : g >= 9 ? '9-10' : String(g);
  }
  function looksLikeName(s) { return /^\s*[A-Za-z][a-z]+\s+[A-Za-z][a-z]+/.test(s || ''); }

  var stdPromise = null, citePromise = null;
  function loadJson(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url); return r.json(); });
  }
  function standards() { return stdPromise || (stdPromise = loadJson('data/standards.json')); }
  function citations() { return citePromise || (citePromise = loadJson('data/citations.json')); }

  /* ---------- timeline meter ---------- */
  function timeline() {
    var period = Number(answers.basics.period) || 0;
    var wrap = h('div', { class: 'timeline', 'aria-live': 'polite' });
    var label = h('span', null);
    var bar = h('span', { class: 'bar' }, h('i', null));
    wrap.append(bar, label);
    wrap.update = function () {
      var t = totalMinutes();
      var pct = period ? Math.min(100, Math.round((t / period) * 100)) : 0;
      bar.firstChild.style.width = pct + '%';
      wrap.classList.toggle('over', period > 0 && t > period);
      label.textContent = period ? (t + ' of ' + period + ' minutes planned') : (t + ' minutes planned');
    };
    wrap.update();
    return wrap;
  }
  function minutesField(path) {
    var tl = timeline();
    var f = numberField(path, { label: 'How many minutes?', hint: 'Your class period is ' + (answers.basics.period || '?') + ' minutes. The five phases should add up to it.', max: 180, onInput: function () { tl.update(); } });
    return [f, tl];
  }

  /* ---------- screens ---------- */
  var SCREENS = [];
  function screen(id, section, title, help, build) { SCREENS.push({ id: id, section: section, title: title, help: help, build: build }); }

  screen('basics', 'basics', 'Who is teaching, and how long is the class?',
    'This is remembered in this browser, so you only answer it once.',
    function () {
      var periodOpts = ['40', '45', '50', '55', '60', '80', '90'];
      var otherId = nid();
      var other = h('input', { id: otherId, type: 'number', inputmode: 'numeric', min: 10, max: 180, placeholder: 'Other length' });
      var pv = String(answers.basics.period || '');
      other.value = periodOpts.indexOf(pv) < 0 ? pv : '';
      other.addEventListener('input', function () { set('basics.period', other.value ? Number(other.value) : ''); g.repaint(); });
      var g = chipGroup({ options: periodOpts, sticky: true, aria: 'Class period length in minutes',
        render: function (x) { return x + ' min'; },
        get: function () { return String(answers.basics.period || ''); },
        set: function (v) { set('basics.period', Number(v)); other.value = ''; } });
      return [
        textField('basics.teacher', { label: 'Your name as it should print on the plan', placeholder: 'Mr. Furlong', autocomplete: 'name', enter: true }),
        chipsField('basics.grade', { label: 'Grade you teach', options: ['6', '7', '8', '9', '10', '11', '12'], sticky: true }),
        textField('basics.subject', { label: 'Subject', placeholder: 'English', enter: true, hint: 'The standards in this tool are Connecticut Core ELA, grades 6 to 12.' }),
        h('div', { class: 'field' }, h('div', { class: 'lab' }, 'Class period length'), g, h('label', { for: otherId, class: 'sr' }, 'Other class length in minutes'), other)
      ];
    });

  screen('focus', 'basics', 'What is this lesson about?',
    'Name the central focus in a short phrase, then pick the skills it builds.',
    function () {
      var bar = null;
      if (profileComplete()) {
        var b = answers.basics;
        bar = h('p', { class: 'hint' }, 'Planning as ' + b.teacher + ', grade ' + b.grade + ', ' + (b.subject || 'English') + ', ' + b.period + '-minute class. ',
          h('button', { type: 'button', class: 'btn quiet small', onclick: function () { go(0); } }, 'Change'));
      }
      return [
        bar,
        textField('focus.text', { label: 'Central focus', placeholder: 'Narrative writing: dialogue and inner thoughts', enter: true }),
        chipsField('focus.skills', { label: 'Related skills', options: B.skills, multi: true, small: true, hint: 'Pick any that apply.' }),
        textField('focus.other', { label: 'Another skill (optional)', placeholder: 'Subtext' })
      ];
    });

  screen('standards', 'A', 'Which standards does it meet?',
    'Pick one to four. The list shows Connecticut Core ELA standards for your grade only.',
    function () {
      var root = h('div', { class: 'fields' });
      var strand = 'All', q = '';
      var chosen = h('div', { class: 'chips', 'aria-label': 'Chosen standards' });
      var count = h('p', { class: 'hint', 'aria-live': 'polite' });
      var list = h('ul', { class: 'std-list' });
      var note = h('p', { class: 'hint' });
      var all = [];
      function paintChosen() {
        chosen.textContent = '';
        answers.standards.forEach(function (code) {
          chosen.append(h('button', { type: 'button', class: 'chip small', 'aria-pressed': 'true', title: 'Remove ' + code, onclick: function () { toggle(code); } }, code + ' ×'));
        });
        count.textContent = answers.standards.length + ' of 4 chosen';
      }
      function toggle(code) {
        var a = answers.standards.slice(), ix = a.indexOf(code);
        if (ix >= 0) a.splice(ix, 1);
        else { if (a.length >= 4) { count.textContent = 'You can pick up to 4. Remove one first.'; return; } a.push(code); }
        set('standards', a);
        paintChosen(); paintList();
      }
      function paintList() {
        var ql = q.trim().toLowerCase();
        var rows = all.filter(function (s) {
          return s.grade_band === gradeBand() && (strand === 'All' || s.code.indexOf(strand + '.') === 0) &&
            (!ql || s.code.toLowerCase().indexOf(ql) >= 0 || s.text.toLowerCase().indexOf(ql) >= 0);
        });
        list.textContent = '';
        rows.slice(0, 60).forEach(function (s) {
          var on = answers.standards.indexOf(s.code) >= 0;
          list.append(h('li', null, h('button', { type: 'button', class: 'std', 'aria-pressed': String(on), onclick: function () { toggle(s.code); } }, h('b', null, s.code), h('span', null, s.text))));
        });
        note.textContent = rows.length === 0 ? 'No standards match. Try a different word or strand.' : (rows.length > 60 ? 'Showing 60 of ' + rows.length + '. Type to narrow the list.' : rows.length + ' standards');
      }
      if (!answers.basics.grade) {
        root.append(h('p', { class: 'warn' }, 'Pick your grade on the first screen to see standards.'));
        return root;
      }
      var sid = nid();
      var search = h('input', { id: sid, type: 'text', placeholder: 'Search by code or word, like W.9-10.3 or dialogue', autocomplete: 'off' });
      search.addEventListener('input', function () { q = search.value; paintList(); });
      var strands = chipGroup({ options: ['All', 'RL', 'RI', 'W', 'SL', 'L'], small: true, sticky: true, aria: 'Strand',
        render: function (x) { return ({ All: 'All strands', RL: 'Literature', RI: 'Informational text', W: 'Writing', SL: 'Speaking and listening', L: 'Language' })[x]; },
        get: function () { return strand; }, set: function (v) { strand = v; }, after: paintList });
      root.append(
        field('Chosen', [chosen, count]),
        field('Find a standard', [search], 'Grade ' + answers.basics.grade + ' uses the ' + gradeBand() + ' standards.', sid),
        strands, list, note);
      paintChosen();
      list.append(h('li', { class: 'hint', style: 'padding:12px' }, 'Loading standards…'));
      standards().then(function (d) { all = d; paintList(); }).catch(function () {
        list.textContent = '';
        list.append(h('li', { class: 'warn', style: 'padding:12px' }, 'The standards did not load. Reload the page. If you opened this file straight from a folder, open it through a web address instead.'));
      });
      return root;
    });

  screen('prior', 'B', 'What do students already know?',
    'Start from a sentence and finish it, or write your own.',
    function () {
      return [pickText('prior', { label: 'What students already know', options: B.priorStarters, prefill: true, rows: 4, placeholder: 'Students have read Six of Crows up to chapters 19 and 20.', hint: 'Fill in anything in {braces}.' })];
    });

  screen('assets', 'B', 'What strengths do students bring that this lesson can use?',
    'Think about language, culture, and experience that can enrich the lesson.',
    function () {
      return [
        chipsField('assets.picks', { label: 'Pick all that apply', options: B.assets, multi: true, small: true }),
        textField('assets.detail', { label: 'One sentence of detail', multiline: true, rows: 3, placeholder: 'Specifically, how they talk to people they know compared to what they think.' })
      ];
    });

  screen('content', 'C', 'What are the core ideas and key terms?',
    'Say the big ideas first, then list up to five terms students need.',
    function () {
      var termsBox = h('div', { class: 'fields' });
      var addBtn = h('button', { type: 'button', class: 'btn small', onclick: function () { answers.content.terms.push({ term: '', definition: '' }); persist(); paintTerms(); } }, 'Add a term');
      function paintTerms() {
        termsBox.textContent = '';
        answers.content.terms.forEach(function (t, ix) {
          var a = nid(), b = nid();
          var ti = h('input', { id: a, type: 'text', placeholder: 'Subtext', value: t.term });
          var di = h('input', { id: b, type: 'text', placeholder: 'What the contrast between what is said and what is thought tells the reader', value: t.definition });
          ti.addEventListener('input', function () { t.term = ti.value; persist(); });
          di.addEventListener('input', function () { t.definition = di.value; persist(); });
          var rm = h('button', { type: 'button', class: 'btn quiet small', onclick: function () { answers.content.terms.splice(ix, 1); if (!answers.content.terms.length) answers.content.terms.push({ term: '', definition: '' }); persist(); paintTerms(); } }, 'Remove');
          termsBox.append(h('div', { class: 'sub' },
            h('div', { class: 'sub-head' }, h('strong', null, 'Term ' + (ix + 1)), rm),
            h('div', { class: 'row2' }, field('Term', ti, null, a), field('Definition', di, null, b))));
        });
        addBtn.hidden = answers.content.terms.length >= 5;
      }
      paintTerms();
      return [
        textField('content.ideas', { label: 'Core ideas and concepts', multiline: true, rows: 4, placeholder: 'Dialogue must serve a purpose. It reveals character, shows relationships, or moves the story forward.' }),
        field('Key academic language', [termsBox, addBtn]),
        chipsField('content.links', { label: 'Connections to other content areas', options: B.connections, multi: true, small: true })
      ];
    });

  screen('objective', 'D', 'What will students be able to do by the end?',
    'Pick the thinking level, a verb, and the kind of knowledge. Then say what students will do.',
    function () {
      var box = h('div', { class: 'fields' });
      var addBtn = h('button', { type: 'button', class: 'btn small', onclick: function () { answers.objectives.push({ level: '', verb: '', knowledge: '', what: '', purpose: '' }); persist(); paint(); } }, 'Add another objective');
      function paint() {
        box.textContent = '';
        answers.objectives.forEach(function (o, ix) {
          var prev = h('p', { class: 'preview', 'aria-live': 'polite' }, swbat(o) || 'Your objective will appear here.');
          function upd() { prev.textContent = swbat(o) || 'Your objective will appear here.'; if (typeof whatLab !== 'undefined') whatLab.textContent = 'Students will ' + (o.verb || 'do what?'); persist(); }
          var verbWrap = h('div', { class: 'field' });
          function paintVerbs() {
            verbWrap.textContent = '';
            if (!o.level) { verbWrap.append(h('div', { class: 'lab' }, 'Verb'), h('p', { class: 'hint' }, 'Pick a level first.')); return; }
            verbWrap.append(h('div', { class: 'lab' }, 'Verb'), chipGroup({ options: B.bloom[o.level], small: true, aria: 'Verb',
              get: function () { return o.verb; }, set: function (v) { o.verb = v; upd(); } }));
          }
          var whatId = nid(), purId = nid();
          var whatLab = h('label', { for: whatId, class: 'lab', style: 'font-weight:700' }, 'Students will ' + (o.verb || 'do what?'));
          var what = h('input', { id: whatId, type: 'text', placeholder: 'Bardugo’s use of dialogue and inner thoughts in chapters 19 and 20', value: o.what });
          var pur = h('input', { id: purId, type: 'text', placeholder: 'to develop the relationship between Nina and Matthias', value: o.purpose });
          what.addEventListener('input', function () { o.what = what.value; upd(); });
          pur.addEventListener('input', function () { o.purpose = pur.value; upd(); });
          var rm = ix > 0 ? h('button', { type: 'button', class: 'btn quiet small', onclick: function () { answers.objectives.splice(ix, 1); persist(); paint(); } }, 'Remove') : null;
          paintVerbs();
          box.append(h('div', { class: 'sub' },
            h('div', { class: 'sub-head' }, h('strong', null, 'Objective ' + (ix + 1)), rm),
            field('Level of thinking', chipGroup({ options: Object.keys(B.bloom), small: true, aria: 'Level of thinking',
              get: function () { return o.level; },
              set: function (v) { o.level = v; if (o.verb && B.bloom[v] && B.bloom[v].indexOf(o.verb) < 0) o.verb = ''; upd(); },
              after: paintVerbs })),
            verbWrap,
            field('Kind of knowledge', chipGroup({ options: B.knowledge, small: true, aria: 'Kind of knowledge', get: function () { return o.knowledge; }, set: function (v) { o.knowledge = v; upd(); } })),
            field(null, [whatLab, what], null, whatId),
            field('To, or so that (optional)', pur, null, purId),
            prev));
        });
        addBtn.hidden = answers.objectives.length >= 3;
      }
      paint();
      return [box, addBtn];
    });

  screen('eq', 'D', 'What essential question will drive the lesson?',
    'A question students can keep coming back to. Start from a stem or write your own.',
    function () {
      return [pickText('eq', { label: 'Essential question', options: B.eqStems, prefill: true, rows: 3, placeholder: 'How do writers use dialogue and inner thoughts to develop characters and relationships?', hint: 'Fill in anything in {braces}.' })];
    });

  screen('materials', 'E', 'What materials do you need?',
    'Pick what applies, then add the specific text and anything else.',
    function () {
      return [
        textField('materials.text', { label: 'Text or book (if any)', placeholder: 'Six of Crows by Leigh Bardugo', enter: true }),
        chipsField('materials.picks', { label: 'Materials', options: B.materials, multi: true, small: true }),
        textField('materials.other', { label: 'Anything else', placeholder: 'Printed copies of chapters 19 and 20', enter: true })
      ];
    });

  screen('grouping', 'F', 'How will students be grouped and seated?',
    'Pick every pattern you will use during the lesson.',
    function () {
      return [
        chipsField('grouping.picks', { label: 'Grouping patterns', options: B.grouping, multi: true, small: true }),
        chipsField('grouping.seating', { label: 'Seating', options: B.seating, small: true }),
        textField('grouping.movement', { label: 'Student movement (optional)', multiline: true, rows: 3, placeholder: 'Two volunteers stand at the front to show the distance between thoughts and dialogue.' })
      ];
    });

  screen('initiation', 'G', 'How does the lesson start?',
    'Plan the opening activity and how you will bring out what students already know.',
    function () {
      return [
        pickText('initiation.motivating', { label: 'Motivating and engaging activity', options: B.activities.motivating, placeholder: 'Journal prompt: Who are you most honest with? Why?' }),
        pickText('initiation.bg', { label: 'Activity for background knowledge', options: B.activities.background, placeholder: 'Discussion: What do you say to people you know, and what do you think?' }),
        minutesField('initiation.minutes')
      ];
    });

  screen('instruction', 'G', 'How will you teach the new idea?',
    'Cover the academic language, how you will model it, and the questions you will ask.',
    function () {
      return [
        pickText('instruction.lang', { label: 'Academic language instruction', options: B.activities.language, placeholder: 'Slides define dialogue and inner thoughts.' }),
        pickText('instruction.direct', { label: 'Direct instruction or modeling', options: B.activities.direct, placeholder: 'Two volunteers demonstrate how Bardugo uses dialogue and inner thoughts.' }),
        textField('instruction.probing', { label: 'Probing questions that push thinking', multiline: true, rows: 3, placeholder: 'Why is it important to have both?', hint: 'One to three questions.' }),
        minutesField('instruction.minutes')
      ];
    });

  screen('guided', 'G', 'What do students practice with your support?',
    'Guided practice is where students try the skill while you can still help.',
    function () {
      return [
        chipsField('guided.grouping', { label: 'How are students grouped?', options: B.grouping, small: true }),
        pickText('guided.task', { label: 'Practice task', options: B.activities.guided, placeholder: 'Pairs find a moment in chapter 19 or 20 and explain why it works.' }),
        minutesField('guided.minutes')
      ];
    });

  screen('independent', 'G', 'What do students do on their own?',
    'Independent practice shows who can use the skill without help.',
    function () {
      return [
        pickText('independent.task', { label: 'Independent task', options: B.activities.independent, placeholder: 'Students apply what they learned from the mentor text to their own writing.' }),
        checkField('independent.same', 'This is also the assessment', 'The template allows independent practice to double as the assessment.'),
        minutesField('independent.minutes')
      ];
    });

  screen('closure', 'G', 'How does the lesson close?',
    'Wrap up the main points and the purpose, and give any homework.',
    function () {
      return [
        pickText('closure.act', { label: 'Closure activity', options: B.activities.closure, placeholder: 'Ask how students used dialogue and inner thoughts in their writing.' }),
        textField('closure.language', { label: 'How students use academic language', multiline: true, rows: 2, placeholder: 'Students use the terms subtext and inner thought in the share-out.' }),
        textField('closure.homework', { label: 'Homework (optional)', placeholder: 'Leave blank for none' }),
        minutesField('closure.minutes')
      ];
    });

  screen('assessment', 'H', 'How will you check that students learned it?',
    'Pick the informal checks and any formal assessment.',
    function () {
      var rub = textField('assessment.rubric', { label: 'Rubric or grading elements', multiline: true, rows: 3, placeholder: 'Four-point rubric: evidence, explanation, use of terms.' });
      function sync() { rub.hidden = get('assessment.graded') !== 'Yes'; }
      var out = [
        chipsField('assessment.informal', { label: 'Informal assessment', options: B.assessments.informal, multi: true, small: true }),
        chipsField('assessment.formal', { label: 'Formal assessment', options: B.assessments.formal, multi: true, small: true }),
        chipsField('assessment.graded', { label: 'Is the formal assessment graded?', options: ['Yes', 'No', 'Used for progress only'], small: true, after: sync }),
        rub
      ];
      sync();
      return out;
    });

  function diffScreen(listPath, noPath, kind) {
    return function () {
      var max = kind === 'struggle' ? 4 : 3;
      var box = h('div', { class: 'fields' });
      var addBtn = h('button', { type: 'button', class: 'btn small', onclick: function () { get(listPath).push({ initials: '', evidence: '', strategy: '' }); persist(); paint(); } }, 'Add a student');
      var noId = nid();
      var no = h('input', { id: noId, type: 'checkbox' });
      no.checked = !!get(noPath);
      no.addEventListener('change', function () { set(noPath, no.checked); paint(); });
      function paint() {
        box.textContent = '';
        var none = !!get(noPath);
        addBtn.hidden = none || get(listPath).length >= max;
        if (none) return;
        get(listPath).forEach(function (r, ix) {
          var iid = nid(), sid = nid();
          var warn = h('p', { class: 'warn' });
          var ini = h('input', { id: iid, type: 'text', placeholder: 'S1', value: r.initials, maxlength: 12, autocomplete: 'off' });
          function chk() { warn.textContent = looksLikeName(ini.value) ? 'That looks like a full name. Use initials or S1, S2.' : ''; }
          ini.addEventListener('input', function () { r.initials = ini.value; chk(); persist(); });
          chk();
          var ta = h('textarea', { id: sid, rows: 3, placeholder: 'What you will do for this student in this lesson' });
          ta.value = r.strategy;
          ta.addEventListener('input', function () { r.strategy = ta.value; persist(); });
          var stratBox = h('div', { class: 'chips' });
          function paintStrats() {
            stratBox.textContent = '';
            var opts = kind === 'struggle' ? (B.diff.strategies[r.evidence] || []) : B.enrich.strategies;
            opts.forEach(function (s) {
              stratBox.append(h('button', { type: 'button', class: 'chip small', title: 'Add to the text box', onclick: function () {
                if (ta.value.indexOf(s) < 0) { ta.value = (ta.value.trim() ? ta.value.trim() + ' ' : '') + s + (/[.!?]$/.test(s) ? '' : '.'); r.strategy = ta.value; persist(); }
                ta.focus();
              } }, '+ ' + s));
            });
            if (!opts.length) stratBox.append(h('span', { class: 'hint' }, kind === 'struggle' && !r.evidence ? 'Pick the evidence first to see suggestions.' : 'Write your own below.'));
          }
          var evid = chipGroup({ options: kind === 'struggle' ? B.diff.evidence : B.enrich.evidence, small: true, aria: 'Evidence',
            get: function () { return r.evidence; }, set: function (v) { r.evidence = v; persist(); }, after: paintStrats });
          var rm = get(listPath).length > 1 ? h('button', { type: 'button', class: 'btn quiet small', onclick: function () { get(listPath).splice(ix, 1); persist(); paint(); } }, 'Remove') : null;
          paintStrats();
          box.append(h('div', { class: 'sub' },
            h('div', { class: 'sub-head' }, h('strong', null, 'Student ' + (ix + 1)), rm),
            field('Initials or S1, S2', [ini, warn], null, iid),
            field(kind === 'struggle' ? 'What shows this student needs support?' : 'What shows this student needs more challenge?', evid),
            h('div', { class: 'field' }, h('div', { class: 'lab' }, 'What will you do?'), h('p', { class: 'hint' }, 'Tap a suggestion to add it, then edit.'), stratBox,
              h('label', { for: sid, class: 'sr' }, 'Strategy'), ta)));
        });
      }
      paint();
      return [
        h('div', { class: 'field' }, h('label', { for: noId, class: 'cite', style: 'display:flex;gap:10px;align-items:center;cursor:pointer;padding:10px 14px' }, no,
          h('span', null, kind === 'struggle' ? 'No students need extra support in this lesson' : 'No students need enrichment in this lesson'))),
        box, addBtn
      ];
    };
  }
  screen('struggle', 'I', 'Which students may struggle, and what will you do?',
    'Use initials or S1, S2. Add a row for each student.', diffScreen('struggling', 'noStruggling', 'struggle'));
  screen('enrich', 'I', 'Which students need more challenge?',
    'Add a row for each student who is ready for more.', diffScreen('enrichment', 'noEnrichment', 'enrich'));

  /* Research connections: suggested from your earlier answers, all editable. */
  function fillSentence(entry) { return window.LessonAssemble.fillSentence(entry, answers); }
  function suggest(list) {
    var a = answers, ids = {}, why = {};
    function on(name, reason) { var e = list.filter(function (x) { return x.name.indexOf(name) === 0; })[0]; if (e) { ids[e.name] = true; why[e.name] = reason; } }
    on('Revised Bloom', 'Always included, because your objective names a thinking level.');
    if (a.guided.task.pick || a.guided.task.text) if (a.independent.task.pick || a.independent.task.text) on('Gradual release', 'You planned guided and independent practice.');
    if ((a.grouping.picks || []).some(function (p) { return /partner|group|jigsaw|stations|conferencing/i.test(p); })) on('Zone of proximal', 'You plan partner or group work.');
    if (a.initiation.bg.pick || a.initiation.bg.text) on('Schema', 'You plan an activity to bring out background knowledge.');
    if ((a.assessment.informal || []).length) on('Formative', 'You plan informal checks during the lesson.');
    if ((!a.noStruggling && a.struggling.some(function (r) { return r.initials; })) || (!a.noEnrichment && a.enrichment.some(function (r) { return r.initials; }))) on('Differentiated', 'You planned support or enrichment for students.');
    if ((a.assets.picks || []).length || a.assets.detail) on('Culturally', 'You named strengths students bring.');
    return { ids: ids, why: why };
  }
  screen('research', 'J', 'Which research backs up your choices?',
    'These are pre-checked from your answers. Check or uncheck, and edit the sentences. Pick at least two.',
    function () {
      var root = h('div', { class: 'fields' }, h('p', { class: 'hint' }, 'Loading…'));
      citations().then(function (list) {
        var r = answers.research;
        var s = suggest(list);
        if (!r.initialized) { Object.keys(s.ids).forEach(function (k) { r.checked[k] = true; }); r.initialized = true; persist(); }
        r.checked['Revised Bloom\'s taxonomy (Anderson & Krathwohl)'] = true;
        root.textContent = '';
        list.forEach(function (e) {
          var cb = h('input', { type: 'checkbox', id: nid() });
          cb.checked = !!r.checked[e.name];
          var isBloom = /^Revised Bloom/.test(e.name);
          if (isBloom) cb.disabled = true;
          var sentence = h('textarea', { rows: 3, 'aria-label': 'Connection sentence for ' + e.name });
          var warn = h('p', { class: 'warn' });
          function ensure() {
            var auto = fillSentence(e);
            if (r.sentences[e.name] == null || r.sentences[e.name] === r.auto[e.name]) r.sentences[e.name] = auto;
            r.auto[e.name] = auto;
            sentence.value = r.sentences[e.name];
            slots();
          }
          function slots() { var n = (sentence.value.match(/\{[^}]+\}/g) || []).length; warn.textContent = n ? 'Fill in ' + n + ' {slot' + (n > 1 ? 's' : '') + '} in this sentence.' : ''; }
          sentence.addEventListener('input', function () { r.sentences[e.name] = sentence.value; slots(); persist(); });
          var body = h('div', { class: 'fields', style: 'gap:8px' }, sentence, warn);
          function show() { body.hidden = !cb.checked; if (cb.checked) ensure(); }
          cb.addEventListener('change', function () { r.checked[e.name] = cb.checked; persist(); show(); });
          root.append(h('div', { class: 'cite' },
            h('label', { for: cb.id }, cb, h('span', null, h('b', null, e.name), ' ', h('span', { class: 'hint' }, e.in_text))),
            h('p', { class: 'why' }, s.why[e.name] || e.use_when),
            body));
          show();
        });
      }).catch(function () {
        root.textContent = '';
        root.append(h('p', { class: 'warn' }, 'The research list did not load. Reload the page.'));
      });
      return root;
    });

  /* ---------- your plan: assembled text, editable, then download ---------- */
  function fileName() {
    var f = (answers.focus.text || 'lesson').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    return 'Lesson Plan - ' + f + '.docx';
  }
  function planScreen(statusEl) {
    var root = h('div', { class: 'review' }, h('p', { class: 'hint' }, 'Building your plan…'));
    Promise.all([standards(), citations()]).then(function (res) {
      var LA = window.LessonAssemble;
      var model = LA.build(answers, res[0], res[1]);
      var P = answers.plan;
      function cur(key, auto) {
        if (P.edits[key] == null || P.edits[key] === P.auto[key]) P.edits[key] = auto;
        P.auto[key] = auto;
        return P.edits[key];
      }
      function head(title, screenIx, reset) {
        return h('h2', null, title, h('span', null, reset,
          screenIx != null ? h('button', { type: 'button', class: 'btn quiet small', onclick: function () { go(screenIx); } }, 'Change answers') : null));
      }
      function box(key, title, screenIx, auto) {
        var value = cur(key, auto);
        var ta = h('textarea', { 'aria-label': title });
        ta.value = value;
        ta.rows = Math.min(16, Math.max(3, value.split('\n').length + Math.ceil(value.length / 80)));
        var warn = h('p', { class: 'warn' });
        function chk() { var n = LA.placeholders(ta.value).length; warn.textContent = n ? n + ' {slot' + (n > 1 ? 's' : '') + '} still need filling in.' : ''; }
        ta.addEventListener('input', function () { P.edits[key] = ta.value; persist(); chk(); });
        var reset = h('button', { type: 'button', class: 'btn quiet small', onclick: function () { P.edits[key] = auto; ta.value = auto; persist(); chk(); } }, 'Reset');
        chk();
        return h('section', null, head(title, screenIx, reset), ta, warn);
      }
      function table(key, title, screenIx, rows) {
        var auto = JSON.stringify(rows);
        var data = JSON.parse(cur(key, auto));
        var body = h('div', { class: 'fields' });
        if (!data.length) body.append(h('p', { class: 'hint' }, 'No students listed. Use Change answers to add some, or leave this blank.'));
        data.forEach(function (r) {
          function save() { P.edits[key] = JSON.stringify(data); persist(); }
          var ini = h('input', { type: 'text', 'aria-label': 'Initials', value: r.initials });
          var ev = h('input', { type: 'text', 'aria-label': 'Evidence', value: r.evidence });
          var st = h('textarea', { rows: 3, 'aria-label': 'Strategy' }); st.value = r.strategy;
          ini.addEventListener('input', function () { r.initials = ini.value; save(); });
          ev.addEventListener('input', function () { r.evidence = ev.value; save(); });
          st.addEventListener('input', function () { r.strategy = st.value; save(); });
          body.append(h('div', { class: 'sub' }, h('div', { class: 'row3' }, ini, ev), st));
        });
        var reset = h('button', { type: 'button', class: 'btn quiet small', onclick: function () { P.edits[key] = auto; persist(); renderPlanInto(); } }, 'Reset');
        return h('section', null, head(title, screenIx, reset), body);
      }
      function header() {
        var f = [['teacher', 'Teacher'], ['grade', 'Grade'], ['subject', 'Subject'], ['centralFocus', 'Central focus'], ['relatedSkill', 'Related skills']];
        var wrap = h('div', { class: 'fields' });
        f.forEach(function (x) {
          var id = nid(), val = cur('h.' + x[0], model.header[x[0]]);
          var inp = h('input', { id: id, type: 'text', value: val });
          inp.addEventListener('input', function () { P.edits['h.' + x[0]] = inp.value; persist(); });
          wrap.append(field(x[1], inp, null, id));
        });
        return h('section', null, head('Header', 0, null), wrap);
      }
      var els = [header(),
        box('A', 'A. Standards', 2, model.sections.A),
        box('B', 'B. Learners’ background', 3, model.sections.B),
        box('C', 'C. Content knowledge', 5, model.sections.C),
        box('D', 'D. Objective and essential question', 6, model.sections.D),
        box('E', 'E. Materials', 8, model.sections.E),
        box('F', 'F. Grouping', 9, model.sections.F)];
      var gScreens = [10, 11, 12, 13, 14, 14];
      model.phases.forEach(function (ph, k) {
        els.push(box('G' + k, 'G. ' + ph.title + (ph.minutes ? ' (' + ph.minutes + ' min)' : ''), gScreens[k], ph.text));
      });
      els.push(box('H', 'H. Assessment', 15, model.sections.H));
      els.push(table('tbl.struggling', 'I. Students who may struggle', 16, model.struggling));
      els.push(table('tbl.enrichment', 'I. Students who need enrichment', 17, model.enrichment));
      els.push(box('J', 'J. Research connections', 18, model.sections.J));
      if (model.references.length) {
        els.push(h('section', null, h('h2', null, 'J. References (from your checked research)'),
          model.references.map(function (r) {
            var p = h('p', { style: 'padding-left:1.5rem;text-indent:-1.5rem' });
            r.split(/(\*[^*]+\*)/).forEach(function (part) { if (/^\*[^*]+\*$/.test(part)) p.append(h('i', null, part.slice(1, -1))); else p.append(part); });
            return p;
          })));
      }
      root.textContent = '';
      els.forEach(function (e) { root.append(e); });
      persist();

      function currentModel() {
        var hd = {};
        ['teacher', 'grade', 'subject', 'centralFocus', 'relatedSkill'].forEach(function (k) { hd[k] = P.edits['h.' + k]; });
        var secs = {};
        ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J'].forEach(function (k) { secs[k] = P.edits[k]; });
        return {
          header: hd, sections: secs,
          phases: model.phases.map(function (ph, k) { return { title: ph.title, minutes: ph.minutes, text: P.edits['G' + k] }; }),
          struggling: JSON.parse(P.edits['tbl.struggling']), enrichment: JSON.parse(P.edits['tbl.enrichment']),
          references: model.references
        };
      }
      root.download = function () {
        statusEl.className = 'msg';
        statusEl.textContent = 'Building your .docx…';
        window.LessonFiller.fillFromUrl(LA.toPlan(currentModel()), 'assets/template.docx').then(function (blob) {
          var url = URL.createObjectURL(blob);
          var a = h('a', { href: url, download: fileName() });
          document.body.append(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
          statusEl.className = 'okmsg msg';
          statusEl.textContent = 'Downloaded ' + fileName() + '. Open it in Word to check it.';
        }).catch(function (err) {
          statusEl.className = 'warn msg';
          statusEl.textContent = 'The .docx could not be built (' + err.message + '). Reload the page and try again. Your answers are saved.';
        });
      };
    }).catch(function () {
      root.textContent = '';
      root.append(h('p', { class: 'warn' }, 'Your plan could not be built because the data files did not load. Reload the page.'));
    });
    function renderPlanInto() { render(); }
    return root;
  }

  /* ---------- sections for the rail ---------- */
  var RAIL = [
    { label: 'Basics', letter: '•', screens: [0, 1] },
    { label: 'Standards', letter: 'A', screens: [2] },
    { label: 'Learners', letter: 'B', screens: [3, 4] },
    { label: 'Content', letter: 'C', screens: [5] },
    { label: 'Objective', letter: 'D', screens: [6, 7] },
    { label: 'Materials', letter: 'E', screens: [8] },
    { label: 'Grouping', letter: 'F', screens: [9] },
    { label: 'Activities', letter: 'G', screens: [10, 11, 12, 13, 14] },
    { label: 'Assessment', letter: 'H', screens: [15] },
    { label: 'Differentiation', letter: 'I', screens: [16, 17] },
    { label: 'Research', letter: 'J', screens: [18] },
    { label: 'Your plan', letter: '✓', screens: [19] }
  ];
  var SECTION_NAMES = { basics: 'Basics', A: 'Section A. Standards', B: 'Section B. Learners’ background', C: 'Section C. Content knowledge', D: 'Section D. Objective and essential question', E: 'Section E. Materials', F: 'Section F. Grouping', G: 'Section G. Learning activities', H: 'Section H. Assessment', I: 'Section I. Differentiation', J: 'Section J. Research' };

  /* ---------- navigation ---------- */
  function blocker(n) {
    var a = answers;
    if (n === 0 && !(a.basics.teacher.trim() && a.basics.grade && a.basics.period)) return 'Add your name, grade, and class length to continue.';
    if (n === 1 && !a.focus.text.trim()) return 'Add a central focus to continue.';
    if (n === 2 && !a.standards.length) return 'Pick at least one standard to continue.';
    if (n === 6) { var o = a.objectives[0]; if (!(o.level && o.verb && o.knowledge && o.what.trim())) return 'Pick a level, verb, and kind of knowledge, and say what students will do.'; }
    if (n === 18) { var c = Object.keys(a.research.checked).filter(function (k) { return a.research.checked[k]; }).length; if (c < 2) return 'Check at least two research connections to continue.'; }
    return '';
  }
  function go(n) {
    i = n;
    if (n > maxSeen) maxSeen = n;
    persist();
    render();
    window.scrollTo(0, 0);
  }
  function next() {
    var m = blocker(i);
    if (m) { var el = document.getElementById('msg'); if (el) el.textContent = m; return; }
    go(i + 1);
  }
  function back() { go(i - 1); }

  function paintChrome() {
    var ruler = document.getElementById('ruler'), rail = document.getElementById('rail'), count = document.getElementById('count');
    ruler.textContent = '';
    for (var n = 0; n < TOTAL; n++) (function (n) {
      var cls = 'tick' + (n === i ? ' now' : n < i ? ' done' : n <= maxSeen ? ' seen' : '');
      var clickable = n < i || (n > i && n <= maxSeen);
      var b = h('button', { type: 'button', class: cls, 'aria-label': 'Question ' + (n + 1) + ': ' + SCREENS[n].title, disabled: !clickable, onclick: function () { go(n); } });
      if (n === i) b.setAttribute('aria-current', 'step');
      ruler.append(h('li', null, b));
    })(n);
    rail.textContent = '';
    RAIL.forEach(function (s) {
      var current = s.screens.indexOf(i) >= 0;
      var complete = s.screens[s.screens.length - 1] < i;
      var reach = s.screens[0] <= maxSeen || s.screens[0] <= i;
      var b = h('button', { type: 'button', class: complete ? 'complete' : '', disabled: !reach, onclick: function () { go(s.screens[0]); } }, h('span', { class: 'letter' }, s.letter), h('span', null, s.label));
      if (current) b.setAttribute('aria-current', 'step');
      rail.append(h('li', null, b));
    });
    count.textContent = i >= 0 && i < TOTAL ? 'Question ' + (i + 1) + ' of ' + TOTAL : '';
  }

  function render() {
    var main = document.getElementById('main');
    main.textContent = '';
    paintChrome();
    var head;
    if (i === -1) {
      head = h('h1', { class: 'q', tabindex: '-1' }, 'Build a lesson plan by answering questions.');
      main.append(h('div', { class: 'intro' }, head,
        h('p', { class: 'lede' }, 'One question at a time. You end up with a finished plan in the University of Bridgeport template, ready for Word.'),
        h('ul', null, h('li', null, 'No account and no sign-in.'), h('li', null, 'No AI writing for you. You choose from lists and write your own answers.'), h('li', null, 'Nothing leaves your browser. Use initials or S1, S2 for students.')),
        h('div', { class: 'nav', style: 'margin-top:0' },
          hasDraft ? h('button', { type: 'button', class: 'btn primary', onclick: function () { go(Math.min(Math.max(draft.i, 0), TOTAL)); } }, 'Continue where you left off (question ' + (Math.min(Math.max(draft.i, 0), TOTAL - 1) + 1) + ' of ' + TOTAL + ')') : null,
          h('button', { type: 'button', class: hasDraft ? 'btn' : 'btn primary', onclick: function () { if (hasDraft) { answers = blank(); maxSeen = 0; hasDraft = false; } go(profileComplete() ? 1 : 0); } }, hasDraft ? 'Start a new plan' : 'Start'))));
      head.focus();
      return;
    }
    if (i === TOTAL) {
      head = h('h1', { class: 'q', tabindex: '-1' }, 'Your lesson plan');
      var status = h('p', { class: 'msg', role: 'status', 'aria-live': 'polite' });
      var planEl = planScreen(status);
      main.append(h('p', { class: 'where' }, 'Ready to download'), head,
        h('p', { class: 'help' }, 'This is your plan in the template\u2019s order. Edit any section, then download it as a Word file.'), planEl, status,
        h('div', { class: 'nav' }, h('button', { type: 'button', class: 'btn', onclick: back }, 'Back'), h('span', { class: 'spacer' }),
          h('button', { type: 'button', class: 'btn primary', onclick: function () { if (planEl.download) planEl.download(); } }, 'Download .docx')));
      head.focus({ preventScroll: true });
      return;
    }
    var s = SCREENS[i];
    head = h('h1', { class: 'q', tabindex: '-1' }, s.title);
    var fields = s.build();
    var msg = h('p', { class: 'warn msg', id: 'msg', role: 'status' });
    main.append(h('p', { class: 'where' }, SECTION_NAMES[s.section]), head, h('p', { class: 'help' }, s.help), h('div', { class: 'fields' }, fields), msg,
      h('div', { class: 'nav' },
        h('button', { type: 'button', class: 'btn', onclick: back }, 'Back'),
        h('span', { class: 'spacer' }),
        h('button', { type: 'button', class: 'btn primary', onclick: next }, i === TOTAL - 1 ? 'Build my plan' : 'Continue')));
    head.focus({ preventScroll: true });
  }

  /* ---------- start over (confirmation built into the page) ---------- */
  var restart = document.getElementById('restart');
  restart.addEventListener('click', function () {
    var p = restart.parentNode;
    var ask = h('span', { role: 'alert' }, 'Delete this draft? ',
      h('button', { type: 'button', class: 'btn small', onclick: function () { store.remove('lp.draft'); answers = blank(); i = -1; maxSeen = 0; hasDraft = false; ask.remove(); restart.hidden = false; render(); window.scrollTo(0, 0); } }, 'Yes, start over'), ' ',
      h('button', { type: 'button', class: 'btn quiet small', onclick: function () { ask.remove(); restart.hidden = false; } }, 'Keep it'));
    restart.hidden = true;
    p.append(ask);
  });

  if (SCREENS.length !== TOTAL) throw new Error('Expected ' + TOTAL + ' screens, found ' + SCREENS.length);
  render();
})();
