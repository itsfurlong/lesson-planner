/*
 * filler.js: plan object in, filled .docx out.
 * Always starts from the bundled template (assets/template.docx). Users never upload anything.
 * Works in the browser (JSZip, DOMParser, XMLSerializer globals) and in Node (inject them via opts).
 *
 * Plan shape (all text fields are strings; inline *italic* and **bold** are supported):
 * {
 *   header: { teacher, grade, subject, centralFocus, relatedSkill },
 *   A: [para, ...], B: [...], C: [...], D: [...], E: [...], F: [...], H: [...], J: [...],
 *   G: [ { title, minutes, paragraphs: [para, ...] } x 6 ],   // initiation, academic language,
 *                                                            // guided, independent, closure, homework
 *   struggling: [ { initials, evidence, strategy }, ... ],
 *   enrichment: [ { initials, evidence, strategy }, ... ]
 * }
 * A para is a string, '' (blank line), or { text, left, hanging, bold, italic }.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LessonFiller = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  var XML_NS = 'http://www.w3.org/XML/1998/namespace';

  // Row positions in the bundled template, with a heading check so a changed template fails loudly.
  var ROW = { A: 2, B: 3, C: 4, D: 5, E: 6, F: 7, G1: 8, G2: 9, G3: 10, H: 11, I: 12, J: 22, K: 23 };
  var HEADINGS = { 2: '(A)', 3: '(B)', 4: '(C)', 5: '(D)', 6: '(E)', 7: '(F)', 8: '(G)', 11: '(H)', 12: '(I)', 22: '(J)', 23: '(K)' };
  var STRUGGLE_SLOTS = [15, 16, 17];
  var ENRICH_SLOTS = [20, 21];

  function toArray(list) { var a = []; for (var i = 0; i < list.length; i++) a.push(list[i]); return a; }
  function kids(node, name) { return toArray(node.childNodes).filter(function (n) { return n.nodeName === name; }); }
  function text(node) { return toArray(node.getElementsByTagName('w:t')).map(function (t) { return t.textContent; }).join(''); }

  function el(doc, name, attrs) {
    var e = doc.createElementNS(W, name);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttributeNS(W, 'w:' + k, String(attrs[k])); });
    return e;
  }

  function cleanText(s) { return String(s == null ? '' : s).replace(/\s*\u2014\s*/g, ', '); } // no em dashes, ever

  function parseInline(s) {
    var out = [], re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g, last = 0, m;
    s = cleanText(s);
    while ((m = re.exec(s))) {
      if (m.index > last) out.push({ t: s.slice(last, m.index) });
      if (m[0].indexOf('**') === 0) out.push({ t: m[0].slice(2, -2), b: true });
      else out.push({ t: m[0].slice(1, -1), i: true });
      last = m.index + m[0].length;
    }
    if (last < s.length) out.push({ t: s.slice(last) });
    return out;
  }

  function makeRun(doc, str, fmt) {
    var r = el(doc, 'w:r');
    if (fmt && (fmt.b || fmt.i)) {
      var rpr = el(doc, 'w:rPr');
      if (fmt.b) rpr.appendChild(el(doc, 'w:b'));
      if (fmt.i) rpr.appendChild(el(doc, 'w:i'));
      r.appendChild(rpr);
    }
    var t = el(doc, 'w:t');
    t.setAttributeNS(XML_NS, 'xml:space', 'preserve');
    t.appendChild(doc.createTextNode(str));
    r.appendChild(t);
    return r;
  }

  function appendRuns(doc, p, str, base) {
    parseInline(str).forEach(function (seg) {
      p.appendChild(makeRun(doc, seg.t, { b: seg.b || (base && base.b), i: seg.i || (base && base.i) }));
    });
  }

  // Body paragraph in the Table Paragraph style, indented like the worked example.
  function makePara(doc, spec, defaults) {
    var o = typeof spec === 'string' ? { text: spec } : spec;
    var d = defaults || {};
    var left = o.left != null ? o.left : (d.left != null ? d.left : 720);
    var p = el(doc, 'w:p');
    var ppr = el(doc, 'w:pPr');
    ppr.appendChild(el(doc, 'w:pStyle', { val: 'TableParagraph' }));
    var ind = { left: left, right: 287 };
    if (o.hanging) { ind.left = left + o.hanging; ind.hanging = o.hanging; }
    ppr.appendChild(el(doc, 'w:ind', ind));
    p.appendChild(ppr);
    if (o.text) appendRuns(doc, p, o.text, { b: o.bold, i: o.italic });
    return p;
  }

  function stripIds(node) {
    if (node.attributes) {
      for (var i = node.attributes.length - 1; i >= 0; i--) {
        var n = node.attributes[i].name;
        if (n.indexOf('w14:') === 0 || n.indexOf('w:rsid') === 0) node.removeAttribute(n);
      }
    }
    toArray(node.childNodes).forEach(stripIds);
    return node;
  }
  function cloneClean(node) { return stripIds(node.cloneNode(true)); }

  function firstCell(row) { return row.getElementsByTagName('w:tc')[0]; }

  // Remove the template's italic "(instructions)" runs from a heading paragraph.
  function stripInstructionRuns(p) {
    kids(p, 'w:r').forEach(function (r) {
      var rpr = kids(r, 'w:rPr')[0];
      var italic = rpr && kids(rpr, 'w:i').length > 0;
      if (italic && text(r).trim().charAt(0) === '(') p.removeChild(r);
    });
  }

  // Keep the heading paragraph, drop the rest of the cell, add the new paragraphs.
  function fillSection(doc, row, paras, defaults) {
    var tc = firstCell(row);
    var ps = kids(tc, 'w:p');
    stripInstructionRuns(ps[0]);
    ps.slice(1).forEach(function (p) { tc.removeChild(p); });
    var list = (paras && paras.length) ? paras : [''];
    list.forEach(function (s) { tc.appendChild(makePara(doc, s, defaults)); });
    tc.appendChild(makePara(doc, '', defaults));   // breathing room before the next section, as in the template
  }

  function setHeader(doc, p, value) {
    if (value) p.appendChild(makeRun(doc, cleanText(value).replace(/^\s+/, ''), {}));
  }

  function fillSlotRow(doc, row, rec) {
    var cells = row.getElementsByTagName('w:tc');
    [rec.initials, rec.evidence, rec.strategy].forEach(function (val, i) {
      var tc = cells[i];
      var p = kids(tc, 'w:p')[0];
      kids(tc, 'w:p').slice(1).forEach(function (x) { tc.removeChild(x); });
      var parts = cleanText(val).split('\n');
      appendRuns(doc, p, parts[0], {});
      parts.slice(1).forEach(function (line) {
        var np = el(doc, 'w:p');
        appendRuns(doc, np, line, {});
        tc.appendChild(np);
      });
    });
  }

  function fillTable(doc, slots, records) {
    if (!records || !records.length) return;
    var rows = slots.slice();
    var last = rows[rows.length - 1];
    while (rows.length < records.length) {
      var copy = cloneClean(last);
      last.parentNode.insertBefore(copy, last.nextSibling);
      rows.push(copy);
      last = copy;
    }
    records.forEach(function (rec, i) { fillSlotRow(doc, rows[i], rec); });
  }

  function fillActivities(doc, rows, phases, headingTemplate) {
    var phaseList = phases || [];
    if (phaseList.length < 3) throw new Error('G needs at least 3 phases (activities, closure, homework).');
    var groups = [phaseList.slice(0, phaseList.length - 2), [phaseList[phaseList.length - 2]], [phaseList[phaseList.length - 1]]];
    groups.forEach(function (group, gi) {
      var tc = firstCell(rows[gi]);
      var ps = kids(tc, 'w:p');
      if (gi === 0) ps.slice(3).forEach(function (p) { tc.removeChild(p); });   // keep heading, InTASC line, spacer
      else ps.forEach(function (p) { tc.removeChild(p); });
      group.forEach(function (ph, idx) {
        var h = cloneClean(headingTemplate);
        kids(h, 'w:r').forEach(function (r) { h.removeChild(r); });
        kids(h, 'w:proofErr').forEach(function (r) { h.removeChild(r); });
        var title = cleanText(ph.title) + (ph.minutes ? ' (' + ph.minutes + ' min)' : '');
        h.appendChild(makeRun(doc, title, { b: true, i: true }));
        tc.appendChild(h);
        var body = (ph.paragraphs && ph.paragraphs.length) ? ph.paragraphs : [''];
        body.forEach(function (s) { tc.appendChild(makePara(doc, s, { left: 1187 })); });
        if (gi === 0 && idx < group.length - 1) tc.appendChild(makePara(doc, '', { left: 1187 }));
      });
      tc.appendChild(makePara(doc, '', { left: 1187 }));
    });
  }

  function fillDocumentXml(xml, plan, impl) {
    var doc = new impl.DOMParser().parseFromString(xml, 'application/xml');
    var rows = toArray(doc.getElementsByTagName('w:tr'));
    if (rows.length !== 24) throw new Error('Template changed: expected 24 table rows, found ' + rows.length);
    Object.keys(HEADINGS).forEach(function (i) {
      if (text(rows[i]).replace(/\s+/g, '').indexOf(HEADINGS[i]) !== 0) throw new Error('Template changed near row ' + i);
    });

    var h = plan.header || {};
    var c0 = rows[0].getElementsByTagName('w:tc'), c1 = rows[1].getElementsByTagName('w:tc');
    setHeader(doc, kids(c0[0], 'w:p')[0], h.teacher);
    setHeader(doc, kids(c0[1], 'w:p')[0], h.grade);
    setHeader(doc, kids(c1[0], 'w:p')[0], h.subject);
    setHeader(doc, kids(c1[1], 'w:p')[0], h.centralFocus);
    setHeader(doc, kids(c1[1], 'w:p')[1], h.relatedSkill);

    var headingTemplate = kids(firstCell(rows[ROW.G1]), 'w:p')[3];   // numbered "Initiation" heading

    // Capture row elements first, because inserting table rows shifts indexes.
    var gRows = [rows[ROW.G1], rows[ROW.G2], rows[ROW.G3]];
    var struggleRows = STRUGGLE_SLOTS.map(function (i) { return rows[i]; });
    var enrichRows = ENRICH_SLOTS.map(function (i) { return rows[i]; });

    ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J'].forEach(function (k) {
      fillSection(doc, rows[ROW[k]], plan[k]);
    });
    fillActivities(doc, gRows, plan.G, headingTemplate);
    fillTable(doc, struggleRows, plan.struggling);
    fillTable(doc, enrichRows, plan.enrichment);

    var out = new impl.XMLSerializer().serializeToString(doc).replace(/^\s*<\?xml[^>]*\?>\s*/, '');   // some serializers add their own declaration
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + out;
  }

  // templateData: ArrayBuffer/Uint8Array/Buffer of assets/template.docx
  function fill(plan, opts) {
    opts = opts || {};
    var impl = {
      JSZip: opts.JSZip || (typeof JSZip !== 'undefined' ? JSZip : null),
      DOMParser: opts.DOMParser || (typeof DOMParser !== 'undefined' ? DOMParser : null),
      XMLSerializer: opts.XMLSerializer || (typeof XMLSerializer !== 'undefined' ? XMLSerializer : null)
    };
    if (!impl.JSZip || !impl.DOMParser || !impl.XMLSerializer) return Promise.reject(new Error('JSZip, DOMParser and XMLSerializer are required.'));
    return impl.JSZip.loadAsync(opts.templateData).then(function (zip) {
      return zip.file('word/document.xml').async('string').then(function (xml) {
        zip.file('word/document.xml', fillDocumentXml(xml, plan, impl));
        var type = opts.type || (typeof Blob !== 'undefined' ? 'blob' : 'nodebuffer');
        return zip.generateAsync({ type: type, compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      });
    });
  }

  function fillFromUrl(plan, url) {
    return fetch(url || 'assets/template.docx').then(function (r) {
      if (!r.ok) throw new Error('Could not load the bundled template.');
      return r.arrayBuffer();
    }).then(function (buf) { return fill(plan, { templateData: buf }); });
  }

  return { fill: fill, fillFromUrl: fillFromUrl, parseInline: parseInline };
});
