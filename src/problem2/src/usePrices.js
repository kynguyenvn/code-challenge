import { useEffect, useState } from "react";
import { PRICES_URL } from "./utils";

// Loads prices once. Keeps the latest price per currency and omits tokens without a price.
export default function usePrices() {
  const [state, setState] = useState({ status: "loading", prices: {} });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(PRICES_URL, { signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((rows) => {
        const latest = {};
        for (const { currency, date, price } of rows) {
          if (!(price > 0)) continue;
          if (!latest[currency] || date > latest[currency].date) latest[currency] = { date, price };
        }
        const prices = Object.fromEntries(Object.entries(latest).map(([k, v]) => [k, v.price]));
        setState({ status: "ready", prices });
      })
      .catch((err) => {
        if (err.name !== "AbortError") setState({ status: "error", prices: {} });
      });
    return () => ctrl.abort();
  }, []);

  return state;
}
