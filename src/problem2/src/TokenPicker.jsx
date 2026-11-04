import { useEffect, useRef, useState } from "react";
import TokenIcon from "./TokenIcon";
import { fmtUsd } from "./utils";

export default function TokenPicker({ tokens, prices, selected, onPick, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const matches = tokens.filter((t) => t.toLowerCase().includes(q));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-100 flex-col rounded-[20px] border border-line bg-card p-5"
        role="dialog"
        aria-label="Select a token"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select a token</h2>
          <button type="button" className="cursor-pointer text-2xl leading-none text-muted" onClick={onClose} aria-label="Close">×</button>
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name…"
          className="mt-3.5 mb-2 rounded-xl border border-line bg-field px-3.5 py-3 outline-none focus:border-accent"
        />
        <ul className="overflow-y-auto" role="listbox">
          {matches.length === 0 && <li className="p-3 text-center text-muted">No tokens found</li>}
          {matches.map((symbol) => (
            <li
              key={symbol}
              role="option"
              aria-selected={symbol === selected}
              tabIndex={0}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 outline-none hover:bg-field focus:bg-field ${symbol === selected ? "bg-accent/20" : ""}`}
              onClick={() => onPick(symbol)}
              onKeyDown={(e) => e.key === "Enter" && onPick(symbol)}
            >
              <TokenIcon symbol={symbol} />
              <span className="flex-1 font-semibold">{symbol}</span>
              <span className="text-[13px] text-muted">{fmtUsd(prices[symbol])}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
