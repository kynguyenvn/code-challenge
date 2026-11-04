// Refactored version of the WalletPage component. See ISSUES.md for the list of issues.
//
// Assumed to exist in the project (not part of the task): BoxProps, WalletRow,
// useWalletBalances, usePrices and the `classes` object (e.g. from makeStyles).
import React, { useMemo } from 'react';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // was missing in the original interface
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

type Props = BoxProps;

// Static data lives outside the component so it is created once.
const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
const UNKNOWN_PRIORITY = -99;

const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? UNKNOWN_PRIORITY;

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Depends only on `balances`: prices do not affect filtering or ordering.
  const sortedBalances = useMemo(
    () =>
      balances
        .map((balance) => ({ balance, priority: getPriority(balance.blockchain) }))
        // keep supported blockchains with a positive balance
        .filter(({ balance, priority }) => priority > UNKNOWN_PRIORITY && balance.amount > 0)
        // priority is computed once per item, not on every comparison;
        // ties (e.g. Zilliqa / Neo) are broken by currency so the order is explicit
        .sort(
          (lhs, rhs) =>
            rhs.priority - lhs.priority || lhs.balance.currency.localeCompare(rhs.balance.currency),
        )
        .map(({ balance }) => balance),
    [balances],
  );

  const rows = useMemo(
    () =>
      sortedBalances.map((balance) => {
        const item: FormattedWalletBalance = {
          ...balance,
          formatted: balance.amount.toFixed(2),
          usdValue: (prices[balance.currency] ?? 0) * balance.amount,
        };
        return (
          <WalletRow
            className={classes.row}
            // stable, unique key instead of the array index
            key={`${item.blockchain}-${item.currency}`}
            amount={item.amount}
            usdValue={item.usdValue}
            formattedAmount={item.formatted}
          />
        );
      }),
    [sortedBalances, prices],
  );

  return (
    <div {...rest}>
      {rows}
      {children}
    </div>
  );
};

export default WalletPage;
