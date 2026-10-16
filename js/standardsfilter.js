/*
 * standardsfilter.js: which standards the standards screen offers.
 * The skill-to-standards map lives in banks.js (LP_BANKS.skillStandards), approved in Lesson-Planner_RevisionMap_v1.md.
 * A skill maps to strand and anchor numbers, for example Narrative writing = W anchors 3, 4, 5, 10.
 * Sub-standards (3a to 3e) come with their anchor. No DOM in here, so it runs in Node too.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LessonStandards = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function strand(code) { return String(code).split('.')[0]; }
  function anchor(code) { var p = String(code).split('.'); return p.length >= 3 ? parseInt(p[2], 10) : NaN; }   // '3b' reads as 3
  function mapped(skills, map) { return (skills || []).filter(function (s) { return map && map[s]; }); }
  function spec(skills, map) {
    var out = {};
    mapped(skills, map).forEach(function (s) {
      Object.keys(map[s]).forEach(function (k) {
        out[k] = out[k] || [];
        map[s][k].forEach(function (n) { if (out[k].indexOf(n) < 0) out[k].push(n); });
      });
    });
    return out;
  }
  function allows(code, sp) { var a = sp[strand(code)]; return !!a && a.indexOf(anchor(code)) >= 0; }
  // Grade band only when no mapped skill is picked or showAll is true; otherwise the union of the skills' standards.
  function filter(standards, band, skills, map, showAll) {
    var sp = spec(skills, map), on = !showAll && mapped(skills, map).length > 0;
    return (standards || []).filter(function (s) { return s.grade_band === band && (!on || allows(s.code, sp)); });
  }
  return { filter: filter, spec: spec, mapped: mapped, allows: allows, anchor: anchor, strand: strand };
});
