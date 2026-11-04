export const PRICES_URL = "https://interview.switcheo.com/prices.json";
export const iconUrl = (symbol) =>
  `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(symbol)}.svg`;

export function parseAmount(value) {
  const v = value.trim();
  if (!/^\d*\.?\d*$/.test(v) || v === "" || v === ".") return NaN;
  return Number(v);
}

export function fmt(n, max = 8) {
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("en-US", { maximumFractionDigits: max, useGrouping: false });
}

export function fmtUsd(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}
