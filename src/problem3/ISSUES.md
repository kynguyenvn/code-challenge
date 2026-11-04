# Problem 3: Messy React

Computational inefficiencies and anti-patterns in the original `WalletPage`, with why each is wrong and how to fix it.
Refactored version: [`WalletPage.tsx`](WalletPage.tsx).

## 1. Logic and runtime errors

| # | Issue | Why it is wrong | Fix |
| --- | --- | --- | --- |
| 1 | `lhsPriority` is used in the filter but never declared (the declared variable is `balancePriority`). | Throws a `ReferenceError` as soon as the filter runs. | Use `balancePriority` (or inline `getPriority(balance.blockchain)`). |
| 2 | The filter keeps `amount <= 0`. | Empty wallets are shown and wallets with funds are dropped. | Keep `amount > 0` on supported blockchains; merge the nested `if`s into one condition. |
| 3 | `WalletBalance` has no `blockchain` field, but `balance.blockchain` is read. | TypeScript compile error. | Add `blockchain: string` (or a union of known chains) to the interface. |
| 4 | The sort comparator returns nothing when priorities are equal. | Returns `undefined` instead of `0`, so the ordering contract is broken. | `rhsPriority - lhsPriority`, plus a tie-break (see #16). |
| 5 | `formattedBalances` is computed and never used. `rows` maps over `sortedBalances` and annotates the items as `FormattedWalletBalance`. | `balance.formatted` is `undefined`, so `formattedAmount` is empty. The annotation hides the mismatch. | Map over the formatted data (or build the formatted value in one place) and type it correctly. |
| 6 | `balance.amount.toFixed()` has no argument. | Rounds to an integer, so `0.0042` is displayed as `0`. | Pass the decimals the UI needs (`toFixed(2)`), or use `Intl.NumberFormat`. |
| 7 | `prices[balance.currency] * balance.amount` when the price is missing. | `undefined * number` is `NaN`, shown as the USD value. | `(prices[currency] ?? 0) * amount`, or hide the value when there is no price. |

## 2. Performance

| # | Issue | Why it is wrong | Fix |
| --- | --- | --- | --- |
| 8 | `useMemo` lists `prices` as a dependency but never uses it. | Every price update re-filters and re-sorts the list for no reason. | Dependencies should be `[balances]` only. |
| 9 | `getPriority` is declared inside the component. | It is re-created on every render and it is not in the `useMemo` dependency list. | Move it to module scope and use a lookup object instead of a `switch`. |
| 10 | `getPriority` is called inside the sort comparator. | Runs about `2 * n log n` times. | Compute each item's priority once, then sort. |
| 11 | `formattedBalances` and `rows` are not memoised. | Rebuilt on every render even when nothing relevant changed. | Derive them with `useMemo` (`[sortedBalances, prices]`). |
| 12 | `WalletRow` is not wrapped in `React.memo` (if it is not already). | Every row re-renders on any parent update. With stable keys and props, `React.memo` lets unchanged rows be skipped. | Wrap `WalletRow` in `React.memo`. |

## 3. Anti-patterns and code smells

| # | Issue | Fix |
| --- | --- | --- |
| 13 | `key={index}`. Index keys break reconciliation when the list is filtered or re-sorted. | Stable unique key such as `` `${blockchain}-${currency}` ``. |
| 14 | `getPriority(blockchain: any)`. Throws away type safety. | Type it as `string` or a `Blockchain` union. |
| 15 | Magic numbers (`-99`, `100`, `50`, ...) and nested `if`s. | Named constant (`UNKNOWN_PRIORITY`) and one priority table. |
| 16 | Zilliqa and Neo share priority `20` with no tie-break. The order then depends on the input order. | Add a secondary sort key (the refactor uses `currency`). |
| 17 | `interface Props extends BoxProps {}` is empty and `children` is destructured but never used. `React.FC<Props>` together with `(props: Props)` repeats the type. | Use a type alias, destructure in the parameter list, and either render `children` or drop it (the refactor renders it). |

## 4. Additional points

- **Missing imports:** `useMemo` (and `BoxProps`, `WalletRow`, the hooks) are not imported, so the snippet does not compile as given.
- **TypeScript type error:** the `rows` callback declares `FormattedWalletBalance` for items that come from a `WalletBalance[]`.
- **`classes` is never declared.** It probably comes from a missing `useStyles()` call.
- **No loading or error handling:** `useWalletBalances()` and `usePrices()` results are used as if they are always available.

## Refactor summary

- Priority table and `getPriority` moved out of the component, typed, with a named default.
- One `useMemo` for filter + sort (`[balances]`), computing priority once per item and breaking ties by currency.
- One `useMemo` for the rows (`[sortedBalances, prices]`) with the formatted amount, a safe USD value and a stable key.
- `children` is rendered, `Props` is a type alias.
- Not covered in code (outside the snippet): loading/error states, `React.memo` on `WalletRow`, and imports for the external types and hooks.
