// Node test: blank and partly filled plans keep the template. Run: NODE_PATH=<dir with jszip and @xmldom/xmldom> node test/filler-blank-test.js
const fs = require('fs'), path = require('path');
const JSZip = require('jszip');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const LF = require('../js/filler.js');
const templateData = fs.readFileSync(path.join(__dirname, '../assets/template.docx'));
const full = JSON.parse(fs.readFileSync(path.join(__dirname, 'plan-6oc.json'), 'utf8'));
let fails = 0;
function ok(name, cond, extra) { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond || !extra ? '' : '\n  ' + extra)); }
const fill = (plan) => LF.fill(plan, { templateData, JSZip, DOMParser, XMLSerializer, type: 'nodebuffer' });
function rowTexts(buf) {
  return JSZip.loadAsync(buf).then(z => z.file('word/document.xml').async('string')).then(xml => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    return Array.prototype.slice.call(doc.getElementsByTagName('w:tr')).map(r =>
      Array.prototype.slice.call(r.getElementsByTagName('w:t')).map(t => t.textContent).join('|'));
  });
}
const blankPlan = () => ({
  header: { teacher: '', grade: '', subject: 'English', centralFocus: '', relatedSkill: '' },
  A: ['', ''], B: ['', ''], C: ['', ''], D: ['', ''], E: ['', ''], F: ['', ''], H: ['', ''], J: ['', ''],
  G: [{ title: 'Initiation', minutes: '', paragraphs: [''] }, { title: 'Academic Language Instruction', minutes: '', paragraphs: [''] },
    { title: 'Guided Practice', minutes: '', paragraphs: [''] }, { title: 'Independent Practice', minutes: '', paragraphs: [''] },
    { title: 'Closure', minutes: '', paragraphs: [''] }, { title: 'Homework', minutes: '', paragraphs: ['None'] }],
  struggling: [], enrichment: []
});

(async () => {
  // isEmptyPlan: the defaults are not content
  ok('blank plan with defaults is empty', LF.isEmptyPlan(blankPlan()));
  let p = blankPlan(); p.header.teacher = 'T'; ok('teacher makes it non-empty', !LF.isEmptyPlan(p));
  p = blankPlan(); p.header.subject = 'Reading'; ok('a changed subject is content', !LF.isEmptyPlan(p));
  p = blankPlan(); p.G[5].paragraphs = ['Read chapter 3']; ok('real homework is content', !LF.isEmptyPlan(p));
  p = blankPlan(); p.G[0].minutes = '10'; ok('minutes alone are content', !LF.isEmptyPlan(p));
  p = blankPlan(); p.struggling = [{ initials: '', evidence: '', strategy: '' }]; ok('empty support row is not content', LF.isEmptyPlan(p));
  p = blankPlan(); p.enrichment = [{ initials: 'S2', evidence: '', strategy: '' }]; ok('a filled challenge row is content', !LF.isEmptyPlan(p));
  p = blankPlan(); p.B = [{ text: '  ' }, 'x']; ok('text in a paragraph object is content', !LF.isEmptyPlan(p));

  // Nothing entered: the file is the template, byte for byte
  const e = await fill(blankPlan());
  ok('empty plan returns the template bytes', Buffer.compare(e, templateData) === 0);
  const e2 = await fill({ header: {}, struggling: [], enrichment: [] });
  ok('a plan object with no keys also returns the template', Buffer.compare(e2, templateData) === 0);

  // A fully filled plan still fills every section
  const t = await rowTexts(templateData);
  const f = await rowTexts(await fill(full));
  ok('full plan has 24 rows', f.length === 24);
  ok('full plan differs from the template in sections A, D, H', [2, 5, 11].every(i => f[i] !== t[i]));

  // Only section D filled: every other row (and the header rows) is the template's text
  p = blankPlan(); p.header.subject = ''; p.D = ['', '**SWBAT:** Students will be able to x.'];
  const d = await rowTexts(await fill(p));
  const changed = t.map((x, i) => x !== d[i] ? i : -1).filter(i => i >= 0);
  ok('only D filled: only row 5 changes', JSON.stringify(changed) === '[5]', JSON.stringify(changed));
  ok('only D filled: D holds the new text', d[5].indexOf('Students will be able to x.') >= 0);

  // Only the teacher name: sections stay as the template has them
  p = blankPlan(); p.header.teacher = 'Ms. T'; p.header.subject = '';
  const h = await rowTexts(await fill(p));
  const ch = t.map((x, i) => x !== h[i] ? i : -1).filter(i => i >= 0);
  ok('only teacher: only row 0 changes', JSON.stringify(ch) === '[0]', JSON.stringify(ch));

  // Only activities (and homework text): G rows change, A to F and H to K do not
  p = blankPlan(); p.header.subject = ''; p.G[0].paragraphs = ['Show a clip.'];
  const g = await rowTexts(await fill(p));
  const cg = t.map((x, i) => x !== g[i] ? i : -1).filter(i => i >= 0);
  ok('only activities: only rows 8, 9, 10 change', JSON.stringify(cg) === '[8,9,10]', JSON.stringify(cg));

  // Only a support row
  p = blankPlan(); p.header.subject = ''; p.struggling = [{ initials: 'S1', evidence: 'e', strategy: 's' }];
  const s = await rowTexts(await fill(p));
  const cs = t.map((x, i) => x !== s[i] ? i : -1).filter(i => i >= 0);
  ok('only a support row: only the first support row changes', JSON.stringify(cs) === '[15]', JSON.stringify(cs));

  // No em dash can come out of any case
  ok('no em dash in the full plan', f.join('').indexOf('—') < 0);
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})().catch(err => { console.error('ERROR', err); process.exit(1); });
