import { Link } from "@tanstack/react-router";

export const LOGO_URL = "https://i.ibb.co/PZThbjmf/1000002876-removebg-preview-2.png";
export const TELEGRAM_URL = "https://t.me/official_marco_22";

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img
        src={LOGO_URL}
        alt="PW-MARCO logo"
        className={compact ? "h-8 w-8 object-contain" : "h-10 w-10 object-contain"}
        width={40}
        height={40}
      />
      <span className="leading-none">
        <span className="block font-display text-base font-bold tracking-tight sm:text-lg">
          PW-MARCO
        </span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Powered by MARCO
        </span>
      </span>
    </Link>
  );
}