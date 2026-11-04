// Problem 1: Three ways to sum to n
// Assumption: for n <= 0 the result is 0.

// A: Gauss formula. Time O(1), space O(1).
var sum_to_n_a = function (n) {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
};

// B: Iterative loop. Time O(n), space O(1).
var sum_to_n_b = function (n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// C: Divide and conquer (sum of range [lo, hi] = left half + right half).
// Time O(n), space O(log n) call stack, so it handles large n
// without the stack overflow that naive recursion (n + sum(n - 1)) hits.
var sum_to_n_c = function (n) {
    var range = function (lo, hi) {
        if (lo > hi) return 0;
        if (lo === hi) return lo;
        var mid = Math.floor((lo + hi) / 2);
        return range(lo, mid) + range(mid + 1, hi);
    };
    return range(1, n);
};

if (typeof module !== "undefined") {
    module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
}
