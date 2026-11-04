import { useState } from "react";
import { iconUrl } from "./utils";

// Token icon with a letter fallback when the image does not exist.
export default function TokenIcon({ symbol }) {
  const [failed, setFailed] = useState(false);
  const base = "inline-flex size-7 flex-none items-center justify-center overflow-hidden rounded-full";
  return failed ? (
    <span className={`${base} bg-gradient-to-br from-accent to-accent2 text-[13px] font-bold`}>{symbol[0]}</span>
  ) : (
    <span className={base}>
      <img className="size-full" src={iconUrl(symbol)} alt="" onError={() => setFailed(true)} />
    </span>
  );
}
