// Usage: NODE_PATH=<dir with jszip and @xmldom/xmldom> node filler-test.js <plan.json> <out.docx>
const fs = require('fs'), path = require('path');
const JSZip = require('jszip');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const LessonFiller = require('../js/filler.js');
const plan = JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname, 'plan-6oc.json'), 'utf8'));
const templateData = fs.readFileSync(path.join(__dirname, '../assets/template.docx'));
LessonFiller.fill(plan, { templateData, JSZip, DOMParser, XMLSerializer, type: 'nodebuffer' })
  .then(buf => { fs.writeFileSync(process.argv[3] || 'out.docx', buf); console.log('wrote', process.argv[3] || 'out.docx', buf.length, 'bytes'); })
  .catch(e => { console.error('FAILED:', e.message); process.exit(1); });
