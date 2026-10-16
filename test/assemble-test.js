// Node test for assemble.js section F and related text. Run: node test/assemble-test.js
const LA = require('../js/assemble.js');
function answers(over) {
  const a = {
    basics: { teacher: 'T', grade: '10', subject: 'English', period: '50' },
    focus: { text: 'Narrative writing', skills: [], other: '' }, standards: [],
    prior: { pick: '', text: '' }, assets: { picks: [], detail: '' },
    content: { ideas: '', terms: [], links: [] }, objectives: [{ level: '', verb: '', knowledge: '', what: '', purpose: '' }],
    eq: { pick: '', text: '' }, materials: { picks: [], text: '', other: '' },
    grouping: { picks: [], otherPattern: '', seating: '', otherSeating: '', movement: '' },
    initiation: { motivating: { pick: '', text: '' }, bg: { pick: '', text: '' }, minutes: '' },
    instruction: { lang: { pick: '', text: '' }, direct: { pick: '', text: '' }, probing: '', minutes: '' },
    guided: { task: { pick: '', text: '' }, grouping: '', minutes: '' }, independent: { task: { pick: '', text: '' }, same: false, minutes: '' },
    closure: { act: { pick: '', text: '' }, language: '', homework: '', minutes: '' },
    assessment: { informal: [], formal: [], graded: '', rubric: '' },
    struggling: [], noStruggling: true, enrichment: [], noEnrichment: true,
    research: { checked: {}, sentences: {}, auto: {} }
  };
  return Object.assign(a, over);
}
let fails = 0;
function eq(name, got, want) { const ok = got === want; if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : '\n  got:  ' + JSON.stringify(got) + '\n  want: ' + JSON.stringify(want))); }
const F = (g) => LA.build(answers({ grouping: Object.assign({ picks: [], otherPattern: '', seating: '', otherSeating: '', movement: '' }, g) }), [], []).sections.F;
eq('other pattern joins the picks', F({ picks: ['Partners'], otherPattern: 'Gallery walk', seating: 'Normal seats' }), 'The class will sit in their normal seats. Students will work in partners and gallery walk during the lesson.');
eq('other pattern alone', F({ otherPattern: 'Gallery walk.' }), 'The class will sit in their normal seats. Students will work in gallery walk during the lesson.');
eq('other seating alone', F({ otherSeating: 'Gather in a circle on the rug' }), 'The class will gather in a circle on the rug.');
eq('chip seating plus other seating', F({ seating: 'Rearranged desks', otherSeating: 'gather on the rug.' }), 'The class will sit in rearranged desks, and gather on the rug.');
eq('no other fields, same as before', F({ picks: ['Partners'], seating: 'Rearranged desks' }), 'The class will sit in rearranged desks. Students will work in partners during the lesson.');
eq('old draft without other fields still builds', LA.build(answers({ grouping: { picks: ['Partners'], seating: 'Normal seats', movement: '' } }), [], []).sections.F, 'The class will sit in their normal seats. Students will work in partners during the lesson.');
process.exit(fails ? 1 : 0);
