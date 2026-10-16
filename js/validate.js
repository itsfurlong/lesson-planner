/*
 * validate.js: the review checks. Rules follow Lesson-Planner_QuestionMap_v1.md, section 5,
 * plus two extra checks (unfilled {slots}, standard codes in section A).
 * run(input) returns { rules: [{id, name, failures: [{message, fix: [{label, screen}]}]}], failCount }.
 * Every failure carries the screen number that fixes it. No DOM in here, so it runs in Node too.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LessonValidate = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var EM = '\u2014';
  var PLAN = 20;   // the "Your lesson plan" screen
  var S = { basics: 0, focus: 1, standards: 2, prior: 3, assets: 4, content: 5, objective: 6, eq: 7, materials: 8, grouping: 9,
    initiation: 10, instruction: 11, guided: 12, independent: 13, closure: 14, assessment: 15, struggling: 16, enrichment: 17, research: 18 };
  var SECTION_SCREEN = { A: S.standards, B: S.prior, C: S.content, D: S.objective, E: S.materials, F: S.grouping, H: S.assessment, J: S.research };
  var SECTION_NAME = { A: 'A. Standards', B: 'B. Learners’ background', C: 'C. Content knowledge', D: 'D. Objective and essential question', E: 'E. Materials', F: 'F. Grouping', H: 'H. Assessment', J: 'J. Research connections' };
  var PHASE_KEYS = ['initiation', 'instruction', 'guided', 'independent', 'closure'];
  var PHASE_NAME = ['Initiation', 'Academic Language Instruction', 'Guided Practice', 'Independent Practice', 'Closure'];
  var PHASE_SCREEN = [S.initiation, S.instruction, S.guided, S.independent, S.closure];

  var RULES = [
    [1, 'Timeline adds up to the class length'],
    [2, 'Objective verb can be measured'],
    [3, 'Objective names a Bloom level and kind of knowledge'],
    [4, 'Standards are valid for your grade'],
    [5, 'Differentiation rows are complete'],
    [6, 'Every required section has text'],
    [7, 'Research connections come from the verified list'],
    [8, 'No em dashes'],
    [9, 'Graded assessment has a rubric'],
    [10, 'No unfilled {slots}'],
    [11, 'Section A matches the standards you picked']
  ];

  function str(x) { return x == null ? '' : String(x); }
  function blank(x) { return !str(x).replace(/\s+/g, ''); }
  function gradeBand(g) { g = Number(g); return g >= 11 ? '11-12' : g >= 9 ? '9-10' : String(g); }
  function fix(label, screen) { return { label: label, screen: screen }; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function ordinal(n) { return n === 0 ? '' : ' ' + (n + 1); }

  function run(inp) {
    var a = inp.answers, model = inp.model, std = inp.standards || [], cites = inp.cites || [], banks = inp.banks || {};
    var out = {};
    RULES.forEach(function (r) { out[r[0]] = []; });
    function fail(id, message, fixes) { out[id].push({ message: message, fix: fixes || [] }); }

    var stdMap = {};
    std.forEach(function (s) { stdMap[s.code] = s; });

    /* 1. Timeline */
    var period = Number(a.basics.period) || 0;
    var sum = 0, missing = [];
    PHASE_KEYS.forEach(function (k, n) {
      var m = Number(a[k].minutes);
      if (!m) missing.push(PHASE_NAME[n]); else sum += m;
    });
    if (!period) fail(1, 'No class length is set, so the timeline cannot be checked.', [fix('Set class length', S.basics)]);
    else if (sum !== period || missing.length) {
      var diff = sum - period;
      var msg = 'Your five phases add up to ' + sum + ' minutes. The class is ' + period + ' minutes' +
        (diff ? ', so you are ' + Math.abs(diff) + ' minutes ' + (diff > 0 ? 'over' : 'short') : '') + '.';
      if (missing.length) msg += ' No minutes entered for: ' + missing.join(', ') + '.';
      fail(1, msg, PHASE_KEYS.map(function (k, n) { return fix(PHASE_NAME[n], PHASE_SCREEN[n]); }));
    }

    /* 2 and 3. Objectives */
    function asList(x) { return (Array.isArray(x) ? x : [x]).map(function (y) { return str(y).trim(); }).filter(Boolean); }
    var notMeasurable = (banks.notMeasurable || []).map(function (x) { return x.toLowerCase(); });
    (a.objectives || []).forEach(function (o, n) {
      var levels = asList(o.level), verbs = asList(o.verb), kinds = asList(o.knowledge);
      var any = levels.length || verbs.length || kinds.length || !blank(o.what) || !blank(o.purpose);
      if (n > 0 && !any) return;
      var label = 'Objective' + ordinal(n);
      if (!verbs.length) fail(2, label + ' has no verb.', [fix('Pick a verb', S.objective)]);
      verbs.forEach(function (raw) {
        var verb = raw.toLowerCase();
        var known = levels.filter(function (l) { return banks.bloom && banks.bloom[l]; });
        if (notMeasurable.indexOf(verb) >= 0) fail(2, label + ' uses “' + verb + '”, which cannot be measured. Pick a verb you could watch or grade.', [fix('Change the verb', S.objective)]);
        else if (known.length && !known.some(function (l) { return banks.bloom[l].indexOf(verb) >= 0; })) fail(2, label + ' uses “' + verb + '”, which is not a ' + (known.length > 1 ? 'verb for any picked level (' + known.join(', ') + ')' : known[0] + ' verb') + '.', [fix('Change the verb', S.objective)]);
      });
      if (!levels.length) fail(3, label + ' has no Bloom level.', [fix('Pick a level', S.objective)]);
      if (!kinds.length) fail(3, label + ' has no kind of knowledge (factual, conceptual, procedural, metacognitive).', [fix('Pick a kind', S.objective)]);
      if (blank(o.what)) fail(3, label + ' does not say what students will do.', [fix('Finish the objective', S.objective)]);
    });
    // The text that goes into the file can still be edited on the plan screen.
    if (model && /be able to\s+(understand|know|learn|appreciate|be aware of|become familiar with)\b/i.test(str(model.sections.D))) {
      fail(2, 'Section D now contains a verb that cannot be measured (understand, know, learn, appreciate).', [fix('Edit section D', S.objective), fix('Edit in your plan', PLAN)]);
    }

    /* 4. Standards */
    if (!(a.standards || []).length) fail(4, 'No standards chosen.', [fix('Pick standards', S.standards)]);
    var band = gradeBand(a.basics.grade);
    (a.standards || []).forEach(function (c) {
      if (!stdMap[c]) fail(4, c + ' is not in the standards list.', [fix('Replace it', S.standards)]);
      else if (a.basics.grade && stdMap[c].grade_band !== band) fail(4, c + ' is a grade ' + stdMap[c].grade_band + ' standard, but you teach grade ' + a.basics.grade + '.', [fix('Replace it', S.standards)]);
    });

    /* 5. Differentiation */
    function looksLikeName(s) { return /[A-Za-z]{4,}/.test(s); }
    [['struggling', 'Students who may struggle', S.struggling, 'noStruggling'], ['enrichment', 'Students who need enrichment', S.enrichment, 'noEnrichment']].forEach(function (g) {
      if (a[g[3]]) return;
      (a[g[0]] || []).forEach(function (r, n) {
        var ini = str(r.initials).trim(), ev = str(r.evidence).trim(), st = str(r.strategy).trim();
        if (!ini && !ev && !st) return;
        var who = ini || 'row ' + (n + 1);
        if (!ini) fail(5, g[1] + ': row ' + (n + 1) + ' has no initials.', [fix('Add initials', g[2])]);
        else if (looksLikeName(ini)) fail(5, g[1] + ': “' + ini + '” looks like a name. Use initials or S1, S2.', [fix('Use initials', g[2])]);
        if (!ev) fail(5, g[1] + ': ' + who + ' has no evidence.', [fix('Add evidence', g[2])]);
        if (!st) fail(5, g[1] + ': ' + who + ' has no strategy.', [fix('Add a strategy', g[2])]);
      });
    });

    /* 6. Required sections */
    if (model) {
      var hd = model.header || {};
      [['teacher', 'Teacher', S.basics], ['grade', 'Grade', S.basics], ['subject', 'Subject', S.basics], ['centralFocus', 'Central focus', S.focus]].forEach(function (f) {
        if (blank(hd[f[0]])) fail(6, 'Header: ' + f[1] + ' is empty.', [fix('Fill it in', f[2])]);
      });
      Object.keys(SECTION_NAME).forEach(function (k) {
        if (blank(model.sections[k])) fail(6, 'Section ' + SECTION_NAME[k] + ' is empty.', [fix('Answer the question', SECTION_SCREEN[k]), fix('Edit in your plan', PLAN)]);
      });
      (model.phases || []).forEach(function (p, n) {
        if (n > 4) { if (blank(p.text)) fail(6, 'Homework is empty. Write the homework or "None".', [fix('Answer the question', S.closure)]); return; }
        if (blank(p.text)) fail(6, 'Section G, ' + PHASE_NAME[n] + ' is empty.', [fix('Answer the question', PHASE_SCREEN[n]), fix('Edit in your plan', PLAN)]);
      });
      ['struggling', 'enrichment'].forEach(function (k) {
        var no = k === 'struggling' ? a.noStruggling : a.noEnrichment;
        var rows = (model[k] || []).filter(function (r) { return !blank(r.initials) || !blank(r.strategy) || !blank(r.evidence); });
        if (!no && !rows.length) fail(6, 'Section I. ' + (k === 'struggling' ? 'Students who may struggle' : 'Students who need enrichment') + ' has no rows. Add a student or tick the box that says there are none.', [fix('Answer the question', k === 'struggling' ? S.struggling : S.enrichment)]);
      });
    }

    /* 7. Citations */
    var checked = Object.keys((a.research && a.research.checked) || {}).filter(function (k) { return a.research.checked[k]; });
    var known = {}, inText = {};
    cites.forEach(function (c) { known[c.name] = c; inText[c.in_text.replace(/^\(|\)$/g, '')] = true; });
    if (checked.length < 2) fail(7, 'Only ' + plural(checked.length, 'research connection is', 'research connections are') + ' checked. Check at least two.', [fix('Check more', S.research)]);
    checked.forEach(function (k) { if (!known[k]) fail(7, '“' + k + '” is not in the verified research list.', [fix('Uncheck it', S.research)]); });
    if (model) {
      (model.references || []).forEach(function (r) {
        if (!cites.some(function (c) { return c.apa7_reference === r; })) fail(7, 'A reference in your plan does not match the verified list: ' + r.slice(0, 60) + '...', [fix('Fix research', S.research)]);
      });
      var re = /\(([^()]*?\d{4}[a-z]?)\)/g, m;
      var jtext = str(model.sections.J);
      while ((m = re.exec(jtext))) {
        if (!inText[m[1]]) fail(7, 'Section J cites (' + m[1] + '), which is not in the verified list.', [fix('Edit in research', S.research), fix('Edit in your plan', PLAN)]);
      }
    }

    /* 9. Rubric */
    if (a.assessment.graded === 'Yes' && blank(a.assessment.rubric)) fail(9, 'The assessment is graded but there is no rubric text.', [fix('Add the rubric', S.assessment)]);

    /* 8 and 10. Em dashes and {slots}, in the answers and in the text that will be downloaded */
    var ANSWER_SCREEN = { basics: S.basics, focus: S.focus, standards: S.standards, prior: S.prior, assets: S.assets, content: S.content, objectives: S.objective, eq: S.eq, materials: S.materials, grouping: S.grouping, initiation: S.initiation, instruction: S.instruction, guided: S.guided, independent: S.independent, closure: S.closure, assessment: S.assessment, struggling: S.struggling, enrichment: S.enrichment, research: S.research };
    var dashScreens = {};
    (function walk(v, top) {
      if (v == null) return;
      if (typeof v === 'string') { if (v.indexOf(EM) >= 0 && top in ANSWER_SCREEN) dashScreens[ANSWER_SCREEN[top]] = true; return; }
      if (typeof v !== 'object') return;
      Object.keys(v).forEach(function (k) { if (top == null && k === 'plan') return; walk(v[k], top == null ? k : top); });
    })(a, null);
    Object.keys(dashScreens).forEach(function (sc) {
      fail(8, 'An answer on question ' + (Number(sc) + 1) + ' has an em dash. The download replaces it with a comma.', [fix('Remove it', Number(sc))]);
    });
    var slotCount = 0;
    function scanText(label, text, screen) {
      text = str(text);
      if (text.indexOf(EM) >= 0) fail(8, label + ' has an em dash. The download replaces it with a comma.', [fix('Edit in your plan', PLAN)].concat(screen != null ? [fix('Go to the question', screen)] : []));
      var slots = text.match(/\{[^}]+\}/g);
      if (slots) { slotCount += slots.length; fail(10, label + ' still has ' + plural(slots.length, 'slot', 'slots') + ' to fill in: ' + slots.slice(0, 3).join(' ') + (slots.length > 3 ? ' ...' : ''), [fix('Edit in your plan', PLAN)].concat(screen != null ? [fix('Go to the question', screen)] : [])); }
    }
    if (model) {
      Object.keys(model.header || {}).forEach(function (k) { scanText('Header ' + k, model.header[k], k === 'centralFocus' || k === 'relatedSkill' ? S.focus : S.basics); });
      Object.keys(SECTION_NAME).forEach(function (k) { scanText('Section ' + SECTION_NAME[k], model.sections[k], SECTION_SCREEN[k]); });
      (model.phases || []).forEach(function (p, n) { scanText('Section G, ' + p.title, p.text, n > 4 ? S.closure : PHASE_SCREEN[n]); });
      ['struggling', 'enrichment'].forEach(function (k) {
        (model[k] || []).forEach(function (r, n) {
          ['initials', 'evidence', 'strategy'].forEach(function (f) { scanText('Section I, ' + (k === 'struggling' ? 'struggling' : 'enrichment') + ' row ' + (n + 1) + ' ' + f, r[f], k === 'struggling' ? S.struggling : S.enrichment); });
        });
      });
    }

    /* 11. Section A codes */
    if (model) {
      var atext = str(model.sections.A);
      var codes = atext.match(/\b[A-Z]{1,5}\.\d{1,2}(?:-\d{1,2})?\.\d{1,2}[a-z]?\b/g) || [];
      var seen = {};
      codes.forEach(function (c) {
        if (seen[c]) return; seen[c] = true;
        if (!stdMap[c]) fail(11, 'Section A lists ' + c + ', which is not in the standards file.', [fix('Pick standards again', S.standards), fix('Edit in your plan', PLAN)]);
      });
      (a.standards || []).forEach(function (c) {
        if (!seen[c] && atext.indexOf(c) < 0) fail(11, 'You picked ' + c + ', but section A no longer lists it.', [fix('Restore in your plan', PLAN)]);
      });
    }

    var rules = RULES.map(function (r) { return { id: r[0], name: r[1], failures: out[r[0]] }; });
    var failCount = rules.reduce(function (s, r) { return s + r.failures.length; }, 0);
    return { rules: rules, failCount: failCount };
  }

  return { run: run, RULES: RULES };
});
