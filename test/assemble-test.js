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
eq('chip seating plus other seating', F({ seating: 'Rearranged desks', otherSeating: 'gather on the rug.' }), 'The class will sit in rearranged desks and gather on the rug.');
eq('no other fields, same as before', F({ picks: ['Partners'], seating: 'Rearranged desks' }), 'The class will sit in rearranged desks. Students will work in partners during the lesson.');
eq('old draft without other fields still builds', LA.build(answers({ grouping: { picks: ['Partners'], seating: 'Normal seats', movement: '' } }), [], []).sections.F, 'The class will sit in their normal seats. Students will work in partners during the lesson.');

// Objective and Bloom sentence with one or several levels, verbs and kinds.
const cites = require('../data/citations.json');
const bloom = cites.filter(c => /Bloom/.test(c.name))[0];
const OB = (o) => answers({ objectives: [Object.assign({ level: [], verb: [], knowledge: [], what: 'a three-paragraph scene', purpose: '' }, o)] });
const J = (o) => LA.fillSentence(bloom, OB(o));
const S = (o) => LA.swbat(OB(o).objectives[0]);
eq('one verb, string draft', S({ verb: 'write', level: 'Create', knowledge: 'procedural' }), 'Students will be able to write a three-paragraph scene.');
eq('one verb, list', S({ verb: ['write'] }), 'Students will be able to write a three-paragraph scene.');
eq('two verbs', S({ verb: ['analyze', 'write'] }), 'Students will be able to analyze and write a three-paragraph scene.');
eq('three verbs', S({ verb: ['analyze', 'compare', 'write'] }), 'Students will be able to analyze, compare and write a three-paragraph scene.');
eq('no verb, no sentence', S({ verb: [] }), '');
eq('Bloom sentence, one of each (string)', J({ verb: 'write', level: 'Create', knowledge: 'procedural' }), 'The objective uses the verb "write", which sits at the Create level of the revised Bloom\'s taxonomy and asks students to work with procedural knowledge (Krathwohl, 2002).');
eq('Bloom sentence, one of each (list) same', J({ verb: ['write'], level: ['Create'], knowledge: ['procedural'] }), J({ verb: 'write', level: 'Create', knowledge: 'procedural' }));
eq('Bloom sentence, several', J({ verb: ['analyze', 'write'], level: ['Analyze', 'Create'], knowledge: ['conceptual', 'procedural'] }), 'The objective uses the verbs "analyze" and "write", which sit at the Analyze and Create levels of the revised Bloom\'s taxonomy and ask students to work with conceptual and procedural knowledge (Krathwohl, 2002).');
eq('Bloom sentence, two verbs one level', J({ verb: ['analyze', 'compare'], level: ['Analyze'], knowledge: ['conceptual'] }), 'The objective uses the verbs "analyze" and "compare", which sit at the Analyze level of the revised Bloom\'s taxonomy and ask students to work with conceptual knowledge (Krathwohl, 2002).');
eq('Bloom sentence, one verb two levels', J({ verb: ['write'], level: ['Create', 'Evaluate'], knowledge: ['procedural'] }), 'The objective uses the verb "write", which sits at the Create and Evaluate levels of the revised Bloom\'s taxonomy and asks students to work with procedural knowledge (Krathwohl, 2002).');
eq('Bloom sentence, nothing picked keeps slots', J({}), 'The objective uses the verb "{verb}", which sits at the {level} level of the revised Bloom\'s taxonomy and asks students to work with {knowledge type} knowledge (Krathwohl, 2002).');
eq('Section D uses the joined verbs', LA.build(OB({ verb: ['analyze', 'write'], level: ['Analyze', 'Create'], knowledge: ['conceptual'] }), [], []).sections.D.indexOf('analyze and write a three-paragraph scene') >= 0, true);

// Gradual release names the kinds of activity the teacher wrote, and falls back when no known kind is named.
const B = new Function('window', require('fs').readFileSync(__dirname + '/../js/banks.js', 'utf8') + ';return window.LP_BANKS')({});
eq('KINDS direct match banks', JSON.stringify(LA.KINDS.direct), JSON.stringify(B.activities.direct));
eq('KINDS guided match banks', JSON.stringify(LA.KINDS.guided), JSON.stringify(B.activities.guided));
eq('KINDS independent match banks', JSON.stringify(LA.KINDS.independent), JSON.stringify(B.activities.independent));
const gr = cites.filter(c => /Gradual/.test(c.name))[0];
const GR = (o) => LA.fillSentence(gr, answers(o));
const act = (pick, text) => ({ pick, text });
eq('gradual release, nothing written', GR({}).indexOf('from teacher modeling to guided practice to independent practice') >= 0, true);
eq('gradual release, written kinds', GR({ instruction: { lang: act('', ''), direct: act('', 'Mini-lesson: Model it.'), probing: '', minutes: '' }, guided: { task: act('', 'Small-group task: do it'), grouping: '', minutes: '' }, independent: { task: act('', 'Short writing task: alone'), same: false, minutes: '' } }).indexOf('from mini-lesson to small-group task to short writing task') >= 0, true);
eq('gradual release, unknown label falls back', GR({ guided: { task: act('', 'Small groups: students write'), grouping: '', minutes: '' } }).indexOf('to guided practice to') >= 0, true);
eq('gradual release, old pick still works', GR({ guided: { task: act('Annotate together', ''), grouping: '', minutes: '' } }).indexOf('to annotate together to') >= 0, true);

// Recommendations pass: background, bridge, look-fors, differentiation specifics.
const BB = (o) => LA.build(answers(o), [], []);
eq('B: knows + struggle + builds on', BB({ prior: { pick: '', text: 'Students can write a short scene.', struggle: 'They skip what the character is thinking', builds: 'Last week’s lesson on dialogue tags' } }).sections.B, 'Students can write a short scene.\nWhere students usually struggle: They skip what the character is thinking.\nThis lesson builds on last week’s lesson on dialogue tags.');
eq('B: old draft without new fields is unchanged', BB({ prior: { pick: '', text: 'Students can write.' } }).sections.B, 'Students can write.');
const IP = (o) => BB({ independent: Object.assign({ task: { pick: '', text: 'Short writing task: write your own scene' }, same: false, minutes: '' }, o) }).phases[3].text;
eq('Independent: bridge is added', IP({ bridge: 'Less help, plus a checklist' }), 'Short writing task: write your own scene.\nStep up from guided practice: Less help, plus a checklist.');
eq('Independent: no bridge, same as before', IP({}), 'Short writing task: write your own scene.');
eq('H: look-fors line', BB({ assessment: { informal: ['Observation during practice'], formal: [], lookfors: 'Thoughts and words disagree once', graded: '', rubric: '' } }).sections.H, 'Informal: Observation during practice.\n\nLook-fors: Thoughts and words disagree once.');
eq('H: look-fors alone', BB({ assessment: { informal: [], formal: [], lookfors: 'One thing', graded: '', rubric: '' } }).sections.H, 'Look-fors: One thing.');
const mod = BB({ noStruggling: false, noEnrichment: false,
  struggling: [{ initials: 'S2', evidence: '504 plan', strategy: 'Printed slides on the desk before class.', impact: 'Reading speed' }],
  enrichment: [{ initials: 'S3', evidence: 'Reads above grade level', strategy: 'Write the scene without naming the feeling.', different: 'Writes a new scene, not a found one' }] });
eq('I: impact rides in the evidence cell', mod.struggling[0].evidence, '504 plan. Area affected: Reading speed.');
eq('I: difference rides in the strategy cell', mod.enrichment[0].strategy, 'Write the scene without naming the feeling. How this differs from the class task: Writes a new scene, not a found one.');
eq('I: old rows unchanged', BB({ noStruggling: false, struggling: [{ initials: 'S1', evidence: 'ELL', strategy: 'x' }] }).struggling[0].evidence, 'ELL');
eq('plan: Look-fors label is bold', LA.toPlan(BB({ assessment: { informal: ['Questioning'], formal: [], lookfors: 'A', graded: '', rubric: '' } })).H.some(l => String(l).indexOf('**Look-fors:**') === 0), true);
eq('no em dashes in any new bank text', JSON.stringify([B.eqStems, B.diff, B.enrich, B.priorStarters]).indexOf('—') < 0, true);
eq('every ELL/IEP/504/ADHD/reader chip is concrete (6+ words)', Object.values(B.diff.strategies).concat([B.enrich.strategies]).every(l => l.every(x => require('../js/validate.js').vagueStrategy(x) === false)), true);
process.exit(fails ? 1 : 0);
