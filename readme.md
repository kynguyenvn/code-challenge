## Solutions

### Problem 1: Three ways to sum to n (`src/problem1`)

Three implementations of `sum_to_n` in [`index.js`](src/problem1/index.js):

| Function     | Approach                                                                | Time | Space    |
| ------------ | ----------------------------------------------------------------------- | ---- | -------- |
| `sum_to_n_a` | Gauss formula `n(n+1)/2`                                                | O(1) | O(1)     |
| `sum_to_n_b` | Iterative loop                                                          | O(n) | O(1)     |
| `sum_to_n_c` | Divide and conquer recursion (avoids stack overflow of naive recursion) | O(n) | O(log n) |

Assumption: for `n <= 0` the result is `0`.

Run the tests (Node.js required):

```bash
node src/problem1/test.js
```

### Problem 2: Fancy Form (`src/problem2`)

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

### Problem 3: Messy React (`src/problem3`)

Analysis of the computational inefficiencies and anti-patterns in the original `WalletPage` component, with a refactored version in [`WalletPage.tsx`](src/problem3/WalletPage.tsx).

**Bugs**

| #   | Issue                                                           | Why it is a problem                                                                           | Fix                                                             |
| --- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | `lhsPriority` is used in the filter but never defined           | Throws a `ReferenceError` at runtime                                                          | Use `balancePriority` (the variable that was actually declared) |
| 2   | Filter keeps balances with `amount <= 0`                        | Logic is inverted: empty wallets are shown and funded ones are hidden                         | Keep balances with a valid priority and `amount > 0`            |
| 3   | Sort comparator has no `return 0` for equal priorities          | Returns `undefined`, so ordering is unstable and inconsistent                                 | Return `rightPriority - leftPriority` (covers the equal case)   |
| 4   | `rows` maps over `sortedBalances` but reads `balance.formatted` | `formatted` does not exist on `WalletBalance`; the computed `formattedBalances` is never used | Map over the formatted list (or format inside the row)          |
| 5   | `prices[balance.currency]` can be `undefined`                   | `usdValue` becomes `NaN` when a price is missing                                              | Fall back to `0` for missing prices                             |
| 6   | `toFixed()` with no argument                                    | Rounds to an integer and drops the decimals                                                   | Use `toFixed(2)` (or the token's precision)                     |

**Anti-patterns and inefficiencies**

| #   | Issue                                                                             | Why it is a problem                                             | Fix                                                                     |
| --- | --------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 7   | `blockchain: any` in `getPriority`, and `WalletBalance` has no `blockchain` field | Loses type safety; the original code does not even type-check   | Add `blockchain` to the interface and use a `Blockchain` union type     |
| 8   | `getPriority` is declared inside the component                                    | Recreated on every render                                       | Move it outside the component                                           |
| 9   | `switch` with repeated `case` blocks                                              | Verbose and harder to extend                                    | Use a `Record<Blockchain, number>` lookup table                         |
| 10  | `getPriority` is called repeatedly inside the sort comparator                     | Same value recomputed O(n log n) times                          | Compute each priority once, then sort                                   |
| 11  | `prices` is in the `useMemo` dependency array but is not used inside it           | Balances are re-filtered and re-sorted every time prices change | Depend on `balances` only                                               |
| 12  | `key={index}` on list items                                                       | Breaks reconciliation when the list is reordered or filtered    | Use a stable unique key such as `balance.currency`                      |
| 13  | `children` is destructured but never used; `rows` is rebuilt on every render      | Dead code and unnecessary work                                  | Remove `children`; memoize `rows`                                       |
| 14  | `formattedBalances` and `rows` are computed in separate passes                    | Two extra loops over the same data                              | Combine filter, sort, format and render into a single memoized pipeline |

**Refactored structure**

```
getPriority (module level, lookup table)
   -> useMemo: filter (amount > 0 and known priority) -> sort -> format
   -> useMemo: map to <WalletRow key={currency} />
```

Assumption: balances with an unknown blockchain are treated as priority `-99` and hidden, matching the original intent.
