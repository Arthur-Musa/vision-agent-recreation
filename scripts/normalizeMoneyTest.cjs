const assert = require('assert');
const normalizeMoney = s => {
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/,/g, '');
  }
  return parseFloat(s);
};

assert.strictEqual(normalizeMoney('1.234,56'), 1234.56);
assert.strictEqual(normalizeMoney('1234.56'), 1234.56);
assert.strictEqual(normalizeMoney('1,234.56'), 1234.56);

console.log('All tests passed');
