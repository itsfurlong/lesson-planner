// Prior-knowledge suggestions: every skill chip has some, none has an em dash, {topic} is the only slot.
var fs = require('fs'), path = require('path');
var B = new Function('window', fs.readFileSync(path.join(__dirname, '../js/banks.js'), 'utf8') + ';return window.LP_BANKS')({});
var fails = 0;
function t(ok, msg) { if (!ok) { fails++; console.log('FAIL ' + msg); } else console.log('PASS ' + msg); }
var skills = B.skillStandards ? Object.keys(B.skillStandards) : [];
t(skills.length === 12, '12 mapped skills');
skills.forEach(function (k) {
  var a = B.priorSuggestions[k];
  t(a && a.length >= 3 && a.length <= 4, k + ' has 3 or 4 suggestions');
  (a || []).forEach(function (s) {
    t(s.indexOf('—') < 0, k + ': no em dash');
    var slots = (s.match(/\{[^}]*\}/g) || []).filter(function (x) { return x !== '{topic}'; });
    t(slots.length === 0, k + ': only {topic} slot');
  });
});
process.exit(fails ? 1 : 0);
