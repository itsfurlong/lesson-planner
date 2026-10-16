// Term bank: every skill has 4 to 8 terms with definitions, no em dashes, no leftover [CHECK] markers.
var fs = require('fs'), path = require('path');
var B = new Function('window', fs.readFileSync(path.join(__dirname, '../js/banks.js'), 'utf8') + ';return window.LP_BANKS')({});
var fails = 0;
function t(ok, msg) { if (!ok) { fails++; console.log('FAIL ' + msg); } else console.log('PASS ' + msg); }
var skills = Object.keys(B.skillStandards);
skills.forEach(function (k) {
  var a = B.termBank[k] || [];
  t(a.length >= 4 && a.length <= 8, k + ': 4 to 8 terms');
  a.forEach(function (e) {
    t(e[0] && e[1] && e[1].length > 10, k + ': ' + e[0] + ' has a definition');
    t((e[0] + e[1]).indexOf('—') < 0 && (e[0] + e[1]).indexOf('[CHECK') < 0, k + ': ' + e[0] + ' clean');
  });
  var names = a.map(function (e) { return e[0].toLowerCase(); });
  t(names.length === new Set(names).size, k + ': no repeats');
});
process.exit(fails ? 1 : 0);
