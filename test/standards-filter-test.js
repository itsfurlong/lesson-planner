// Node test for the skill-to-standards filter. Run: node test/standards-filter-test.js
const fs = require('fs'), path = require('path');
const LS = require('../js/standardsfilter.js');
const std = require('../data/standards.json');
const B = new Function('window', fs.readFileSync(path.join(__dirname, '../js/banks.js'), 'utf8') + ';return window.LP_BANKS')({});
const M = B.skillStandards;
let fails = 0;
function eq(name, got, want) { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : '\n  got:  ' + JSON.stringify(got) + '\n  want: ' + JSON.stringify(want))); }
const n = (band, skills, all) => LS.filter(std, band, skills, M, all).length;
// counts from Lesson-Planner_RevisionMap_v1.md section 1 (grade 9-10, then grade 6)
const want910 = { 'Narrative writing': 9, 'Argument writing': 12, 'Informational/Expository writing': 10, 'Characterization': 3, 'Conflict': 2, 'Theme': 2, 'Evidence and citation': 6, 'Vocabulary': 11, 'Grammar and conventions': 9, 'Discussion skills': 9, 'Research': 5, 'Revising and editing': 11 };
Object.keys(want910).forEach(s => eq('9-10 ' + s, n('9-10', [s]), want910[s]));
eq('grade 6 Narrative', n('6', ['Narrative writing']), 9);
eq('grade 6 Vocabulary', n('6', ['Vocabulary']), 12);
eq('no skills shows the whole grade band', n('9-10', []), std.filter(s => s.grade_band === '9-10').length);
eq('unmapped skill only shows the whole grade band', n('9-10', ['Not a skill']), std.filter(s => s.grade_band === '9-10').length);
eq('View all shows the whole grade band', n('9-10', ['Theme'], true), std.filter(s => s.grade_band === '9-10').length);
const a = LS.filter(std, '9-10', ['Narrative writing'], M).map(s => s.code), b = LS.filter(std, '9-10', ['Argument writing'], M).map(s => s.code);
const u = LS.filter(std, '9-10', ['Narrative writing', 'Argument writing'], M).map(s => s.code);
eq('union has no duplicates and equals the set union', u.length, new Set(a.concat(b)).size);
eq('sub-standards ride with their anchor', ['W.9-10.3a', 'W.9-10.3e'].every(c => a.indexOf(c) >= 0) && a.indexOf('W.9-10.2') < 0, true);
eq('only the chosen grade band comes back', LS.filter(std, '9-10', ['Narrative writing'], M).every(s => s.grade_band === '9-10'), true);
eq('every anchor in the map exists in the standards file', Object.keys(M).every(sk => Object.keys(M[sk]).every(st => M[sk][st].every(an => std.some(s => LS.strand(s.code) === st && LS.anchor(s.code) === an)))), true);
process.exit(fails ? 1 : 0);
