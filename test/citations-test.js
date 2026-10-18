// Node test for automatic APA citations. Run: node test/citations-test.js
const LA = require('../js/assemble.js');
const cites = require('../data/citations.json');
const stds = [
  { code: 'RL.9-10.3', text: 'Analyze how complex characters develop.' },
  { code: 'W.9-10.3.b', text: 'Use narrative techniques.' },
  { code: 'RL.9-10.5', text: 'Analyze how an author structures a text.' }
];
function answers(over) {
  return Object.assign({
    basics: { teacher: 'T', grade: '10', subject: 'English', period: '50' },
    focus: { text: '', skills: [], other: '' }, standards: [],
    prior: { pick: '', text: '' }, assets: { picks: [], detail: '' },
    content: { ideas: '', terms: [], links: [] }, objectives: [{ level: [], verb: [], knowledge: [], what: '', purpose: '' }],
    eq: { pick: '', text: '' }, materials: { picks: [], text: '', other: '' },
    grouping: { picks: [], otherPattern: '', seating: '', otherSeating: '', movement: '' },
    initiation: { motivating: { pick: '', text: '' }, bg: { pick: '', text: '' }, minutes: '' },
    instruction: { lang: { pick: '', text: '' }, direct: { pick: '', text: '' }, probing: '', minutes: '' },
    guided: { task: { pick: '', text: '' }, grouping: '', minutes: '' }, independent: { task: { pick: '', text: '' }, same: false, minutes: '' },
    closure: { act: { pick: '', text: '' }, language: '', homework: '', minutes: '' },
    assessment: { informal: [], formal: [], graded: '', rubric: '' },
    struggling: [], noStruggling: true, enrichment: [], noEnrichment: true,
    research: { checked: {}, sentences: {}, auto: {} }
  }, over);
}
let fails = 0;
function ok(name, cond) { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + name); }
const FULL = '(National Governors Association Center for Best Practices & Council of Chief State School Officers [NGA & CCSSO], 2010)';
const SHORT = '(NGA & CCSSO, 2010)';
const NGA = (r) => r.indexOf('National Governors Association Center for Best Practices & Council of Chief State School Officers. (2010).') === 0;

let m = LA.build(answers({ standards: ['RL.9-10.3'] }), stds, cites);
ok('one standard: full-form cite', m.sections.A === 'RL.9-10.3: Analyze how complex characters develop. ' + FULL);
ok('one standard: NGA reference present once', m.references.filter(NGA).length === 1);

m = LA.build(answers({ standards: ['RL.9-10.3', 'W.9-10.3.b', 'RL.9-10.5'] }), stds, cites);
const lines = m.sections.A.split('\n\n');
ok('three standards: first full, others short', lines[0].endsWith(FULL) && lines[1].endsWith(SHORT) && lines[2].endsWith(SHORT));
ok('three standards: one NGA reference', m.references.filter(NGA).length === 1);

m = LA.build(answers({}), stds, cites);
ok('no standard: A empty, no references', m.sections.A === '' && m.references.length === 0 && m.sections.J === '');

const pick = (names) => { const c = {}; names.forEach(n => c[n] = true); return c; };
const vy = cites.filter(c => /^Zone/.test(c.name))[0].name, pg = cites.filter(c => /^Schema/.test(c.name))[0].name, bl = cites.filter(c => /^Revised Bloom/.test(c.name))[0].name;
m = LA.build(answers({ standards: ['RL.9-10.3'], research: { checked: pick([vy, pg, bl]), sentences: {}, auto: {} } }), stds, cites);
const refs = m.references.join('\n');
ok('picks: Beach, Krathwohl, Tuckman and NGA listed', /^Beach, R\./m.test(refs) && /^Krathwohl, D\. R\. \(2002\)/m.test(refs) && /^Tuckman, B\. W\./m.test(refs) && /^National Governors/m.test(refs));
ok('picks: references alphabetical', m.references.join('|') === m.references.slice().sort((x, y) => x.toLowerCase() < y.toLowerCase() ? -1 : 1).join('|'));
ok('picks: J has page cites', m.sections.J.indexOf('as cited in Beach et al., 2026, p. 41') >= 0 && m.sections.J.indexOf('Tuckman & Monetti, 2011, pp. 46-47') >= 0 && m.sections.J.indexOf('Krathwohl, 2002') >= 0);
ok('picks: no Anderson, Piaget, or Vygotsky reference left', !/Anderson|Piaget, J\.|Vygotsky, L\./.test(refs));
ok('no em dashes in A, J or references', !new RegExp(String.fromCharCode(8212)).test(m.sections.A + m.sections.J + refs));
const plan = LA.toPlan(m);
ok('plan: References heading and hanging entries', plan.J.indexOf('**References**') > 0 && plan.J.filter(x => x && x.hanging).length === m.references.length);
ok('plan: standard code still bolded on A lines', plan.A.some(l => /^\*\*RL\.9-10\.3:\*\*/.test(l)));
process.exit(fails ? 1 : 0);
