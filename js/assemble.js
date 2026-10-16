/*
 * assemble.js: interview answers in, section text out.
 * Sentence templates follow Lesson-Planner_QuestionMap_v1.md, section 3.
 * Citations come only from data/citations.json (connection_template and apa7_reference).
 * No em dashes ever leave this file: they are replaced with a comma and counted.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LessonAssemble = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var dashes = 0;
  function clean(s) {
    s = String(s == null ? '' : s);
    return s.replace(/\s*\u2014\s*/g, function () { dashes++; return ', '; });
  }
  function trim(s) { return clean(s).replace(/^\s+|\s+$/g, ''); }
  function lowerFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function endSentence(s) { s = trim(s); return !s ? '' : (/[.!?)"”]$/.test(s) ? s : s + '.'); }
  function stripEnd(s) { return trim(s).replace(/[.\s]+$/, ''); }
  function list(items) {
    items = items.filter(Boolean);
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  // Level, verb and knowledge can be one string (older drafts) or a list. Always work with a list of non-empty strings.
  function asList(x) {
    if (Array.isArray(x)) return x.map(trim).filter(Boolean);
    var s = trim(x);
    return s ? [s] : [];
  }
  function sentenceList(items) {
    items = items.filter(Boolean).map(trim);
    return list(items.map(function (x, i) { return i === 0 ? x : lowerFirst(x); }));
  }
  // "Pick: details" without repeating the pick when the details already start with it.
  function pt(x) {
    var pick = trim(x && x.pick), text = trim(x && x.text);
    if (pick && text) return text.toLowerCase().indexOf(pick.toLowerCase()) === 0 ? text : pick + ': ' + text;
    return text || pick;
  }

  // The kind of activity a teacher named, either picked (older drafts) or written as "Kind: details". Only known kinds count.
  // Keep these lists the same as B.activities in banks.js (test/assemble-test.js checks).
  var KINDS = {
    direct: ['Mini-lesson', 'Teacher think-aloud', 'Mentor text analysis', 'Worked example', 'Student volunteers demonstrate'],
    guided: ['Partner work with graphic organizer', 'Small-group task', 'Annotate together', 'Practice with feedback'],
    independent: ['Exit slip', 'Short writing task', 'Annotation', 'Problem set', 'Reading response']
  };
  function kindOf(x, kinds, fallback) {
    var pk = trim(x && x.pick), m = trim(x && x.text).match(/^([^:\n]{2,40}):/);
    var name = pk || (m ? trim(m[1]) : '');
    for (var i = 0; i < kinds.length; i++) if (kinds[i].toLowerCase() === name.toLowerCase()) return lowerFirst(kinds[i]);
    return fallback;
  }

  /* ---- research sentences (also used by the interview screen) ---- */
  function slotValues(entry, a) {
    var o = a.objectives[0] || {}, v = {};
    var focus = a.focus.text ? trim(lowerFirst(a.focus.text).split(':')[0]) : '{topic}';
    var partnered = (a.grouping.picks || []).some(function (p) { return /partner|group|jigsaw|stations/i.test(p); });
    if (/Bloom/.test(entry.name)) {
      var vs = asList(o.verb), ls = asList(o.level), ks = asList(o.knowledge);
      v['verb'] = vs.length > 1 ? list(vs.map(function (x) { return '"' + x + '"'; })) : (vs[0] || '{verb}');
      v['level'] = list(ls) || '{level}';
      v['knowledge type'] = list(ks) || '{knowledge type}';
    }
    if (/Gradual/.test(entry.name)) {
      v['modeled'] = kindOf(a.instruction.direct, KINDS.direct, 'teacher modeling');
      v['guided'] = kindOf(a.guided.task, KINDS.guided, 'guided practice');
      v['independent'] = kindOf(a.independent.task, KINDS.independent, 'independent practice');
    }
    if (/Zone/.test(entry.name)) { v['task'] = focus; v['teacher or peers'] = partnered ? 'the teacher and partners' : 'the teacher'; }
    if (/Schema/.test(entry.name)) v['topic'] = focus;
    if (/Formative/.test(entry.name)) v['informal assessment'] = list((a.assessment.informal || []).map(lowerFirst)) || '{informal assessment}';
    if (/Culturally/.test(entry.name)) v['connection'] = list((a.assets.picks || []).map(lowerFirst)) || '{connection}';
    if (/Differentiated/.test(entry.name)) {
      var cats = (a.struggling || []).map(function (r) { return r.evidence; }).filter(Boolean);
      v['learner group'] = cats.length ? list(cats.map(function (c) { return LEARNERS[c] || 'students who need support'; }).filter(function (x, k, arr) { return arr.indexOf(x) === k; })) : '{learner group}';
    }
    return v;
  }
  var LEARNERS = { 'ELL': 'English language learners', 'IEP': 'students with IEPs', '504 plan': 'students with 504 plans', 'ADHD': 'students with ADHD', 'Struggling reader': 'struggling readers' };
  function fillSentence(entry, a) {
    var v = slotValues(entry, a), tpl = entry.connection_template;
    if (/Bloom/.test(entry.name)) {
      // Plural wording on top of the template. One of each reads exactly as the template says.
      var bo = (a.objectives || [])[0] || {};
      if (asList(bo.verb).length > 1) tpl = tpl.replace('the verb "{verb}"', 'the verbs {verb}').replace('which sits at', 'which sit at').replace('and asks students', 'and ask students');
      if (asList(bo.level).length > 1) tpl = tpl.replace('{level} level of', '{level} levels of');
    }
    return tpl.replace(/\{([^}]+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; });
  }

  /* ---- sections ---- */
  function swbat(o) {
    var vs = asList(o.verb);
    if (!vs.length || !trim(o.what)) return '';
    return 'Students will be able to ' + list(vs) + ' ' + stripEnd(o.what) + (trim(o.purpose) ? ' ' + stripEnd(o.purpose) : '') + '.';
  }
  var SEATING = {
    'Normal seats': 'sit in their normal seats',
    'Rearranged desks': 'sit in rearranged desks',
    'Stations around the room': 'move between stations around the room',
    'Floor or other space': 'work on the floor or in another space'
  };

  function build(a, standards, cites) {
    dashes = 0;
    var stdMap = {};
    (standards || []).forEach(function (s) { stdMap[s.code] = s; });
    var m = { header: {}, sections: {}, phases: [], struggling: [], enrichment: [], references: [] };

    var skills = (a.focus.skills || []).concat(trim(a.focus.other) ? [trim(a.focus.other)] : []);
    m.header = {
      teacher: trim(a.basics.teacher), grade: String(a.basics.grade || ''), subject: trim(a.basics.subject),
      centralFocus: trim(a.focus.text), relatedSkill: skills.join(', ')
    };

    // A
    m.sections.A = (a.standards || []).map(function (c) { var s = stdMap[c]; return c + ': ' + (s ? trim(s.text) : ''); }).join('\n\n');

    // B
    var assets = (a.assets.picks || []).map(function (x, i) { return i === 0 ? lowerFirst(x) : lowerFirst(x); });
    var b1 = trim(a.prior.text);
    var b2 = (assets.length ? 'Students will draw on ' + list(assets) + '.' : '') + (trim(a.assets.detail) ? (assets.length ? ' ' : '') + endSentence(a.assets.detail) : '');
    m.sections.B = [b1, b2].filter(Boolean).join('\n');

    // C
    var terms = (a.content.terms || []).filter(function (t) { return trim(t.term) || trim(t.definition); })
      .map(function (t) { return trim(t.term) && trim(t.definition) ? trim(t.term) + ' - ' + trim(t.definition) : (trim(t.term) || trim(t.definition)); });
    var links = (a.content.links || []).filter(function (x) { return x !== 'None'; });
    var c = [];
    if (trim(a.content.ideas)) c.push(trim(a.content.ideas));
    if (terms.length) { c.push(''); c.push('Key Academic Language:'); terms.forEach(function (t) { c.push(t); }); }
    if (links.length || (a.content.links || []).indexOf('None') >= 0) { c.push(''); c.push('Connections to other content areas:'); c.push(links.length ? links.join(', ') : 'None'); }
    m.sections.C = c.join('\n');

    // D
    var objs = (a.objectives || []).map(swbat).filter(Boolean);
    var d = objs.map(function (s, i) { return 'SWBAT' + (objs.length > 1 ? ' ' + (i + 1) : '') + ': ' + s; });
    if (trim(a.eq.text)) { if (d.length) d.push(''); d.push('EQ: ' + trim(a.eq.text)); }
    m.sections.D = d.join('\n');

    // E
    var mats = [];
    if (trim(a.materials.text)) mats.push(trim(a.materials.text));
    (a.materials.picks || []).forEach(function (p) { if (!(p === 'The book or text' && trim(a.materials.text))) mats.push(lowerFirst(p)); });
    if (trim(a.materials.other)) mats.push(lowerFirst(stripEnd(a.materials.other)));
    m.sections.E = mats.length ? mats.join(', ') + '.' : '';

    // F
    var gp = (a.grouping.picks || []).map(lowerFirst);
    if (trim(a.grouping.otherPattern)) gp.push(lowerFirst(stripEnd(a.grouping.otherPattern)));
    var f = [];
    var seat = [SEATING[a.grouping.seating], trim(a.grouping.otherSeating) ? lowerFirst(stripEnd(a.grouping.otherSeating)) : ''].filter(Boolean).join(' and ');
    var f1 = '';
    if (seat || gp.length) f1 = 'The class will ' + (seat || 'sit in their normal seats') + '.' + (gp.length ? ' Students will work in ' + list(gp) + ' during the lesson.' : '');
    if (a.guided.grouping && (a.grouping.picks || []).indexOf(a.guided.grouping) < 0) f1 += (f1 ? ' ' : '') + 'Guided practice is done in ' + lowerFirst(a.guided.grouping) + '.';
    if (f1) f.push(f1);
    if (trim(a.grouping.movement)) f.push(endSentence(a.grouping.movement));
    m.sections.F = f.join('\n');

    // G
    function phase(title, min, lines) { return { title: title, minutes: min ? String(min) : '', text: lines.filter(function (x) { return x != null && x !== ''; }).map(endSentence).join('\n') }; }
    m.phases = [
      phase('Initiation', a.initiation.minutes, [pt(a.initiation.motivating), pt(a.initiation.bg)]),
      phase('Academic Language Instruction', a.instruction.minutes, [pt(a.instruction.lang), pt(a.instruction.direct), trim(a.instruction.probing) ? 'Probing questions: ' + trim(a.instruction.probing) : '']),
      phase('Guided Practice', a.guided.minutes, [endSentence(pt(a.guided.task))]),
      phase('Independent Practice', a.independent.minutes, [pt(a.independent.task) ? endSentence(pt(a.independent.task)) + (a.independent.same ? ' This also serves as the assessment.' : '') : '']),
      phase('Closure', a.closure.minutes, [pt(a.closure.act), trim(a.closure.language)]),
      { title: 'Homework', minutes: '', text: trim(a.closure.homework) || 'None' }
    ];

    // H
    var h = [];
    if ((a.assessment.informal || []).length) h.push('Informal: ' + endSentence(sentenceList(a.assessment.informal)));
    var formal = (a.assessment.formal || []).length ? endSentence(sentenceList(a.assessment.formal)) : '';
    var grade = a.assessment.graded === 'Yes' ? (trim(a.assessment.rubric) ? 'Graded. ' + endSentence(a.assessment.rubric) : 'Graded.')
      : a.assessment.graded === 'No' ? 'Not graded.'
      : a.assessment.graded === 'Used for progress only' ? 'Not graded, used to monitor progress.' : '';
    if (formal || grade) { if (h.length) h.push(''); h.push('Formal: ' + [formal, grade].filter(Boolean).join(' ')); }
    m.sections.H = h.join('\n');

    // I
    function rows(list, none) {
      if (none) return [];
      return (list || []).filter(function (r) { return trim(r.initials) || trim(r.strategy); })
        .map(function (r) { return { initials: trim(r.initials), evidence: trim(r.evidence), strategy: trim(r.strategy) }; });
    }
    m.struggling = rows(a.struggling, a.noStruggling);
    m.enrichment = rows(a.enrichment, a.noEnrichment);

    // J: connection sentences from the interview (editable there), then APA references from citations.json
    var ch = a.research.checked || {}, sent = [];
    (cites || []).forEach(function (e) {
      if (!ch[e.name]) return;
      var s = a.research.sentences && a.research.sentences[e.name];
      sent.push(trim(s || fillSentence(e, a)));
      m.references.push(trim(e.apa7_reference));
    });
    m.references.sort(function (x, y) { return x.toLowerCase() < y.toLowerCase() ? -1 : 1; });
    m.sections.J = sent.join('\n\n');

    m.replacedDashes = dashes;
    return m;
  }

  function placeholders(text) { return (String(text || '').match(/\{[^}]+\}/g) || []); }

  /* ---- model -> plan object for filler.js. Plain text in, template formatting out. ---- */
  var LABEL = /^(SWBAT( \d)?:|EQ:|Key Academic Language:|Connections to other content areas:|Informal:|Formal:|Probing questions:)/;
  function lines(text) { return String(text == null ? '' : text).replace(/\r/g, '').split('\n').map(clean); }
  function boldLabel(line) {
    var m = line.match(LABEL);
    return m ? '**' + m[0] + '**' + line.slice(m[0].length) : line;
  }
  function toParagraphs(key, text) {
    var ls = lines(text), out = [], inTerms = false;
    ls.forEach(function (line) {
      if (key === 'C') {
        if (/^Key Academic Language:/.test(line)) { inTerms = true; out.push('**Key Academic Language:**'); return; }
        if (!line.trim()) inTerms = false;
        if (/^Connections to other content areas:/.test(line)) { out.push('**Connections to other content areas:**'); return; }
        if (inTerms && line.indexOf(' - ') > 0) { var ix = line.indexOf(' - '); out.push('**' + line.slice(0, ix) + '**' + line.slice(ix)); return; }
      }
      if (key === 'A') { var sm = line.match(/^([A-Z]{1,2}\.[\d-]+\.\d+[a-f]?:)/); out.push(sm ? '**' + sm[1] + '**' + line.slice(sm[1].length) : line); return; }
      out.push(boldLabel(line));
    });
    return [''].concat(out);
  }
  function toPlan(model) {
    var plan = { header: model.header };
    ['A', 'B', 'C', 'D', 'E', 'F', 'H'].forEach(function (k) { plan[k] = toParagraphs(k, model.sections[k]); });
    plan.J = toParagraphs('J', model.sections.J);
    if (model.references.length) {
      plan.J.push('');
      plan.J.push('**References**');
      model.references.forEach(function (r) { plan.J.push({ text: clean(r), hanging: 360 }); });
    }
    plan.G = model.phases.map(function (p) {
      return { title: p.title, minutes: p.minutes, paragraphs: lines(p.text).map(boldLabel) };
    });
    plan.struggling = model.struggling;
    plan.enrichment = model.enrichment;
    return plan;
  }

  return { build: build, toPlan: toPlan, fillSentence: fillSentence, placeholders: placeholders, swbat: swbat, asList: asList, joinAnd: list, KINDS: KINDS };
});
