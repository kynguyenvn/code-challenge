import { useEffect, useMemo, useRef, useState } from "react";
import usePrices from "./usePrices";
import TokenIcon from "./TokenIcon";
import TokenPicker from "./TokenPicker";
import { fmt, fmtUsd, parseAmount } from "./utils";

function TokenButton({ symbol, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-haspopup="listbox" className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-card px-3 py-2 font-semibold transition hover:bg-[#22254a] active:scale-95">
      <TokenIcon symbol={symbol} />
      <span>{symbol}</span>
      <span className="text-xs text-muted">▾</span>
    </button>
  );
}

function Field({ id, label, value, onChange, symbol, onPickToken, usd, error }) {
  return (
    <section className={`rounded-2xl border bg-field px-4 py-3.5 transition-colors focus-within:border-accent ${error ? "border-danger" : "border-transparent"}`}>
      <label htmlFor={id} className="text-[13px] text-muted">{label}</label>
      <div className="mt-2 flex items-center gap-3">
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" placeholder="0.0" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder:text-[#5a5e88]" />
        <TokenButton symbol={symbol} onClick={onPickToken} />
      </div>
      <div className="mt-1 min-h-4.5 text-[13px] text-muted">{usd}</div>
      {error && <p className="text-[13px] text-danger" role="alert">{error}</p>}
    </section>
  );
}

export default function App() {
  const { status, prices } = usePrices();
  const tokens = useMemo(() => Object.keys(prices).sort((a, b) => a.localeCompare(b)), [prices]);

  const [from, setFrom] = useState("ETH");
  const [to, setTo] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [picking, setPicking] = useState(null); // "from" | "to" | null
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  // Fall back to available tokens if the defaults have no price.
  useEffect(() => {
    if (!tokens.length) return;
    const f = prices[from] ? from : tokens[0];
    const t = prices[to] && to !== f ? to : tokens.find((x) => x !== f);
    if (f !== from) setFrom(f);
    if (t !== to) setTo(t);
  }, [tokens, prices, from, to]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (status === "error") showToast("Failed to load token prices. Please reload.", "error");
  }, [status]);

  const rate = prices[from] && prices[to] ? prices[from] / prices[to] : null;

  const errors = useMemo(() => {
    const e = { from: "", to: "" };
    const raw = fromAmount.trim();
    const n = parseAmount(raw);
    if (raw === "") e.from = "Enter an amount to swap";
    else if (Number.isNaN(n)) e.from = "Amount must be a valid number";
    else if (n <= 0) e.from = "Amount must be greater than 0";
    if (from === to) e.to = "Choose two different tokens";
    else if (!rate) e.to = "No price available for this pair";
    return e;
  }, [fromAmount, from, to, rate]);

  // Recompute the other side from whichever input was edited.
  const editFrom = (value) => {
    setTouched(true);
    setFromAmount(value);
    const n = parseAmount(value);
    setToAmount(rate && n >= 0 ? fmt(n * rate) : "");
  };
  const editTo = (value) => {
    setTouched(true);
    setToAmount(value);
    const n = parseAmount(value);
    setFromAmount(rate && n >= 0 ? fmt(n / rate) : "");
  };

  const flip = () => {
    setFrom(to);
    setTo(from);
    // Keep the amounts attached to their original currency.
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const pick = (symbol) => {
    let nf = from;
    let nt = to;
    if (picking === "from") {
      if (symbol === to) nt = from;
      nf = symbol;
    } else {
      if (symbol === from) nf = to;
      nt = symbol;
    }
    setFrom(nf);
    setTo(nt);
    const r = prices[nf] && prices[nt] ? prices[nf] / prices[nt] : null;
    const n = parseAmount(fromAmount);
    setToAmount(r && n >= 0 ? fmt(n * r) : "");
    setPicking(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (errors.from || errors.to || submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1800)); // mock backend call
    setSubmitting(false);
    showToast(`Swapped ${fromAmount} ${from} for ${toAmount} ${to}`);
    setFromAmount("");
    setToAmount("");
    setTouched(false);
  };

  const a = parseAmount(fromAmount);
  const b = parseAmount(toAmount);
  const usdFrom = a > 0 && prices[from] ? `≈ ${fmtUsd(a * prices[from])}` : "";
  const usdTo = b > 0 && prices[to] ? `≈ ${fmtUsd(b * prices[to])}` : "";

  return (
    <>
      <div className="flex min-h-screen items-center justify-center p-4">
      <main className="w-full max-w-110 rounded-3xl border border-line bg-card p-6 shadow-2xl shadow-black/50">
        <form onSubmit={submit} noValidate>
          <header className="mb-4 flex items-center justify-between">
            <h1 className="text-[22px] font-bold">Swap</h1>
            <span className={`rounded-full bg-field px-2.5 py-1 text-xs ${status === "ready" ? "text-accent2" : status === "error" ? "text-danger" : "text-muted"}`}>
              {status === "ready" ? "Live prices" : status === "error" ? "Could not load prices" : "Loading prices…"}
            </span>
          </header>

          <Field id="input-amount" label="Amount to send" value={fromAmount} onChange={editFrom}
            symbol={from} onPickToken={() => setPicking("from")} usd={usdFrom} error={touched ? errors.from : ""} />

          <button type="button" onClick={flip} className="relative z-1 mx-auto -my-3 flex size-10 cursor-pointer items-center justify-center rounded-[14px] border-4 border-card bg-card outline outline-line transition duration-300 hover:rotate-180 hover:bg-accent" aria-label="Switch tokens">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v16M7 20l-4-4M7 20l4-4M17 20V4M17 4l-4 4M17 4l4 4" /></svg>
          </button>

          <Field id="output-amount" label="Amount to receive" value={toAmount} onChange={editTo}
            symbol={to} onPickToken={() => setPicking("to")} usd={usdTo} error={touched ? errors.to : ""} />

          <div className="mt-5 mb-3 min-h-5 text-center text-[13px] text-muted">
            {rate && `1 ${from} = ${fmt(rate, 6)} ${to}  ·  1 ${to} = ${fmt(1 / rate, 6)} ${from}`}
          </div>

          <button type="submit" className="w-full cursor-pointer rounded-2xl bg-gradient-to-br from-accent to-[#5b8cff] p-4 font-bold tracking-wider text-white transition hover:not-disabled:brightness-110 active:not-disabled:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting || !tokens.length}>
            {submitting && <span className="mr-2.5 inline-block size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]" />}
            {submitting ? "SWAPPING…" : "CONFIRM SWAP"}
          </button>
        </form>
      </main>
      </div>

      {picking && (
        <TokenPicker tokens={tokens} prices={prices} selected={picking === "from" ? from : to}
          onPick={pick} onClose={() => setPicking(null)} />
      )}

      <div role="status" className={`pointer-events-none fixed bottom-7 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl px-4.5 py-3 text-sm text-white shadow-xl transition duration-300 ${toast ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"} ${toast?.type === "error" ? "bg-[#a6334a]" : "bg-[#1f7a62]"}`}>{toast?.message}</div>
    </>
  );
}
