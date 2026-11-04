// Run with: node src/problem1/test.js
const assert = require("assert");
const impls = require("./index");

const cases = [
    [5, 15],
    [1, 1],
    [0, 0],
    [-3, 0],
    [10, 55],
    [100000, 5000050000],
];

for (const [name, fn] of Object.entries(impls)) {
    for (const [n, expected] of cases) {
        assert.strictEqual(fn(n), expected, `${name}(${n}) should be ${expected}`);
    }
    console.log(`${name}: all ${cases.length} cases passed`);
}
