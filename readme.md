# 99Tech Code Challenge #1 #

Note that if you fork this repository, your responses may be publicly linked to this repo.  
Please submit your application along with the solutions attached or linked.   

It is important that you minimally attempt the problems, even if you do not arrive at a working solution.

## Submission ##
You can either provide a link to an online repository, attach the solution in your application, or whichever method you prefer.
We're cool as long as we can view your solution without any pain.

## Solutions ##

### Problem 1: Three ways to sum to n (`src/problem1`) ###
Three implementations of `sum_to_n` in [`index.js`](src/problem1/index.js):

| Function | Approach | Time | Space |
| --- | --- | --- | --- |
| `sum_to_n_a` | Gauss formula `n(n+1)/2` | O(1) | O(1) |
| `sum_to_n_b` | Iterative loop | O(n) | O(1) |
| `sum_to_n_c` | Divide and conquer recursion (avoids stack overflow of naive recursion) | O(n) | O(log n) |

Assumption: for `n <= 0` the result is `0`.

Run the tests (Node.js required):

```bash
node src/problem1/test.js
```

### Problem 2: Fancy Form (`src/problem2`) ###
A currency swap form built with React, Vite and Tailwind CSS.

- Token prices are fetched from `https://interview.switcheo.com/prices.json` (latest price per token; tokens without a price are omitted).
- Token icons come from the `Switcheo/token-icons` repository, with a letter fallback when an icon is missing.
- Amounts convert both ways (editing either field updates the other), with a rate display and a button to switch tokens.
- Input validation with error messages: empty amount, invalid number, amount <= 0, same token on both sides, pair without a price.
- Submit is mocked with a loading state (about 1.8s) followed by a success message.

Run locally (Node.js required):

```bash
cd src/problem2
npm install
npm run dev
```

Production build: `npm run build`, then `npm run preview` to serve it.
